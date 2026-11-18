/**
 * Run with:  npm test      (or: node --test tests/)
 * Uses Node's built-in test runner, so no extra dependencies are needed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateNumber,
  binaryToDecimal,
  decimalToBinary,
  binaryToOctal,
  binaryToHex,
  hexToDecimal,
  octalToDecimal,
  convertAll,
  toTwosComplement,
  fromTwosComplement,
  signedRange,
  groupBits,
} from '../src/utils/numberSystems.js';
import { evaluate, calculate } from '../src/utils/arithmetic.js';
import { runBooth, validateBoothInputs } from '../src/utils/booth.js';

/* ---------------------------------------------------------------- conversion */
test('binary, octal, decimal and hexadecimal inputs parse in their own base', () => {
  assert.equal(validateNumber('1011', 2).value, 11n);
  assert.equal(validateNumber('755', 8).value, 493n);
  assert.equal(validateNumber('255', 10).value, 255n);
  assert.equal(validateNumber('A3', 16).value, 163n);
  assert.equal(validateNumber('a3', 16).value, 163n);
});

test('prefixes, signs and grouping are handled', () => {
  assert.equal(validateNumber('0xFF', 16).value, 255n);
  assert.equal(validateNumber('0b1010', 2).value, 10n);
  assert.equal(validateNumber('-0o17', 8).value, -15n);
  assert.equal(validateNumber('+42', 10).value, 42n);
  assert.equal(validateNumber('1010 0011', 2).value, 163n);
  assert.equal(validateNumber('-0', 10).value, 0n);
});

test('invalid digits give meaningful errors', () => {
  assert.match(validateNumber('1021', 2).error, /"2" is not a valid binary digit/);
  assert.match(validateNumber('789', 8).error, /"8" is not a valid octal digit/);
  assert.match(validateNumber('12A', 10).error, /"A" is not a valid decimal digit/);
  assert.match(validateNumber('G1', 16).error, /"G" is not a valid hexadecimal digit/);
  assert.match(validateNumber('', 10).error, /Enter a value/);
  assert.match(validateNumber('-', 10).error, /at least one digit/);
});

test('named conversion helpers', () => {
  assert.equal(binaryToDecimal('10100011'), 163n);
  assert.equal(binaryToDecimal('-101'), -5n);
  assert.equal(decimalToBinary(163n), '10100011');
  assert.equal(decimalToBinary(-5n), '-101');
  assert.equal(binaryToOctal('10100011'), '243');
  assert.equal(binaryToHex('10100011'), 'A3');
  assert.equal(binaryToHex('-10100011'), '-A3');
  assert.equal(binaryToHex('0000'), '0');
  assert.equal(hexToDecimal('FF'), 255n);
  assert.equal(octalToDecimal('377'), 255n);
});

test('very large values stay exact (BigInt)', () => {
  const big = validateNumber('FFFFFFFFFFFFFFFFFFFF', 16).value; // 80 bits
  assert.equal(big, (1n << 80n) - 1n);
  assert.equal(calculate(big, 1n, 'add'), 1n << 80n);
  assert.deepEqual(convertAll(255n), { bin: '11111111', oct: '377', dec: '255', hex: 'FF' });
  assert.deepEqual(convertAll(-255n), { bin: '-11111111', oct: '-377', dec: '-255', hex: '-FF' });
});

/* ---------------------------------------------------------------- two's complement */
test("two's complement conversion", () => {
  assert.equal(toTwosComplement(5n, 8), '00000101');
  assert.equal(toTwosComplement(-5n, 8), '11111011');
  assert.equal(toTwosComplement(-128n, 8), '10000000');
  assert.equal(toTwosComplement(127n, 8), '01111111');
  assert.equal(toTwosComplement(0n, 4), '0000');
  assert.equal(fromTwosComplement('11111011'), -5n);
  assert.equal(fromTwosComplement('1000'), -8n);
  assert.equal(fromTwosComplement('0111'), 7n);
  assert.throws(() => toTwosComplement(128n, 8), RangeError);
  assert.throws(() => toTwosComplement(-129n, 8), RangeError);
  assert.deepEqual(signedRange(4), { min: -8n, max: 7n });
  assert.equal(groupBits('1111111011', 4), '11 1111 1011');
});

test("round trip: every 8-bit value survives to/from two's complement", () => {
  for (let v = -128n; v <= 127n; v += 1n) {
    assert.equal(fromTwosComplement(toTwosComplement(v, 8)), v);
  }
});

/* ---------------------------------------------------------------- arithmetic */
test('mixed-format operands: A3 (hex) and 1011 (binary)', () => {
  const run = (operation) => evaluate({ aText: 'A3', aRadix: 16, bText: '1011', bRadix: 2, operation });
  assert.equal(run('add').result, 174n); // 163 + 11
  assert.equal(run('sub').result, 152n); // 163 - 11
  assert.equal(run('mul').result, 1793n); // 163 * 11
});

test('negative, zero and mixed-sign arithmetic', () => {
  const run = (a, ar, b, br, op) => evaluate({ aText: a, aRadix: ar, bText: b, bRadix: br, operation: op }).result;
  assert.equal(run('-5', 10, '3', 10, 'add'), -2n);
  assert.equal(run('5', 10, '-8', 10, 'sub'), 13n);
  assert.equal(run('-6', 10, '-7', 10, 'mul'), 42n);
  assert.equal(run('0', 10, '999', 10, 'mul'), 0n);
  assert.equal(run('-0', 10, '0', 2, 'add'), 0n);
  assert.equal(run('777', 8, '1FF', 16, 'sub'), 0n); // 511 - 511
});

test('evaluate reports an error per operand', () => {
  const res = evaluate({ aText: '2', aRadix: 2, bText: 'Z', bRadix: 16, operation: 'add' });
  assert.equal(res.ok, false);
  assert.ok(res.errors.a && res.errors.b);
});

/* ---------------------------------------------------------------- Booth: known trace */
test('Booth 7 x 3 in 4 bits matches the hand-worked textbook trace', () => {
  const r = runBooth(7n, 3n, 4);
  assert.equal(r.M, '0111');
  const rows = r.steps.map((s) => [s.A, s.Q, s.Qm1]);
  assert.deepEqual(rows, [
    ['0000', '0011', '0'], // initial
    ['1100', '1001', '1'], // 10 -> A = A - M = 1001, then shift
    ['1110', '0100', '1'], // 11 -> shift
    ['0010', '1010', '0'], // 01 -> A = A + M = 0101, then shift
    ['0001', '0101', '0'], // 00 -> shift
  ]);
  assert.deepEqual(
    r.steps.slice(1).map((s) => [s.pair, s.op, s.afterOp]),
    [
      ['10', 'sub', '1001'],
      ['11', 'shift', '1100'],
      ['01', 'add', '0101'],
      ['00', 'shift', '0010'],
    ],
  );
  assert.equal(r.productBits, '00010101');
  assert.equal(r.product, 21n);
});

test('Booth -3 x 5 in 4 bits (negative multiplicand)', () => {
  const r = runBooth(-3n, 5n, 4);
  assert.equal(r.M, '1101');
  assert.equal(r.productBits, '11110001'); // -15 in 8 bits
  assert.equal(r.product, -15n);
});

test('Booth 6 x -5 in 4 bits (negative multiplier)', () => {
  const r = runBooth(6n, -5n, 4);
  assert.equal(r.productBits, '11100010'); // -30 in 8 bits
  assert.equal(r.product, -30n);
});

test('Booth zero operands', () => {
  assert.equal(runBooth(0n, 5n, 8).product, 0n);
  assert.equal(runBooth(5n, 0n, 8).product, 0n);
  assert.equal(runBooth(0n, 0n, 8).productBits, '0000000000000000');
});

test('Booth most-negative operands need the extra sign bit', () => {
  const r = runBooth(-8n, 1n, 4);
  assert.equal(r.product, -8n);
  assert.ok(r.steps.some((s) => s.overflow), 'an overflow step is flagged');
  assert.equal(runBooth(-8n, -8n, 4).product, 64n);
  assert.equal(runBooth(-128n, -128n, 8).product, 16384n);
  assert.equal(runBooth(127n, 127n, 8).product, 16129n);
});

test('Booth handles different bit widths including 2, 16 and 32', () => {
  assert.equal(runBooth(-2n, -2n, 2).product, 4n);
  assert.equal(runBooth(-1n, -1n, 2).product, 1n);
  assert.equal(runBooth(1234n, -567n, 16).product, 1234n * -567n);
  assert.equal(runBooth(2147483647n, -2147483648n, 32).product, 2147483647n * -2147483648n);
});

test('Booth input validation reports overflow and bad widths', () => {
  const tooBig = validateBoothInputs(8n, 1n, 4);
  assert.equal(tooBig.valid, false);
  assert.match(tooBig.errors.m, /does not fit in 4 bits/);
  assert.equal(validateBoothInputs(1n, 1n, 1).valid, false);
  assert.equal(validateBoothInputs(1n, 1n, 33).valid, false);
  assert.throws(() => runBooth(100n, 1n, 4), RangeError);
});

test('Booth exhaustive check: every operand pair for widths 2 to 8', () => {
  for (let bits = 2; bits <= 8; bits += 1) {
    const { min, max } = signedRange(bits);
    for (let m = min; m <= max; m += 1n) {
      for (let q = min; q <= max; q += 1n) {
        const r = runBooth(m, q, bits);
        assert.equal(r.product, m * q, `${m} x ${q} in ${bits} bits`);
        assert.equal(r.productBits.length, bits * 2);
        assert.equal(r.steps.length, bits + 1);
      }
    }
  }
});
