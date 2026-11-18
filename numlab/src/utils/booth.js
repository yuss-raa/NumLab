/**
 * booth.js
 * ----------------------------------------------------------------------------
 * Booth's multiplication algorithm for signed two's complement integers.
 *
 * Registers (all `bits` wide):
 *   M  - multiplicand
 *   A  - accumulator, starts at 0
 *   Q  - multiplier
 *   Q-1 - single extra bit appended to the right of Q, starts at 0
 *
 * Each of the `bits` iterations looks at the pair (Q0, Q-1):
 *   00 -> arithmetic right shift
 *   01 -> A = A + M, then shift
 *   10 -> A = A - M, then shift
 *   11 -> arithmetic right shift
 * The shift moves the combined register [A | Q | Q-1] one place to the right and
 * keeps the sign bit of A. The 2n-bit product ends up in [A | Q].
 *
 * IMPORTANT: the product is produced only by the add/subtract/shift loop below.
 * JavaScript's `*` operator is never used to build the result or the steps.
 *
 * Overflow note: when M is the most negative value (for example -8 in 4 bits),
 * or A +/- M exceeds the register range, the sum needs bits + 1 bits. Real
 * hardware keeps that carry/sign bit for the shift, so this implementation does
 * the same: it keeps the sum in (bits + 1) bits, shifts it, and the result fits
 * in `bits` bits again.
 */
import { fromTwosComplement, signedRange, toTwosComplement, bitsNeeded } from './numberSystems.js';

export const MIN_BITS = 2;
export const MAX_BITS = 32;

const bin = (value, width) => (value & ((1n << BigInt(width)) - 1n)).toString(2).padStart(width, '0');

/** Interpret an unsigned `width`-bit pattern as a signed value. */
const signed = (value, width) => {
  const w = BigInt(width);
  return value >= 1n << (w - 1n) ? value - (1n << w) : value;
};

/**
 * Check that both operands can be represented in `bits` bits.
 * @returns {{valid: boolean, errors: {bits?: string, m?: string, q?: string}}}
 */
export function validateBoothInputs(multiplicand, multiplier, bits) {
  const errors = {};
  if (!Number.isInteger(bits) || bits < MIN_BITS || bits > MAX_BITS) {
    errors.bits = `Bit width must be a whole number from ${MIN_BITS} to ${MAX_BITS}.`;
    return { valid: false, errors };
  }
  const { min, max } = signedRange(bits);
  const explain = (v) =>
    `${v} does not fit in ${bits} bits (range ${min} to ${max}). It needs at least ${bitsNeeded(v)} bits.`;
  if (multiplicand < min || multiplicand > max) errors.m = explain(multiplicand);
  if (multiplier < min || multiplier > max) errors.q = explain(multiplier);
  return { valid: Object.keys(errors).length === 0, errors };
}

const EXPLAIN = {
  '00': 'Q0 Q−1 = 00: the middle of a run of 0s, so nothing is added or subtracted.',
  '11': 'Q0 Q−1 = 11: the middle of a run of 1s, so nothing is added or subtracted.',
  '01': 'Q0 Q−1 = 01: the end of a run of 1s, so the multiplicand is added.',
  '10': 'Q0 Q−1 = 10: the start of a run of 1s, so the multiplicand is subtracted.',
};

/**
 * Run Booth's algorithm.
 *
 * @param {bigint} multiplicand signed value
 * @param {bigint} multiplier   signed value
 * @param {number} bits         register width, MIN_BITS..MAX_BITS
 * @returns {{
 *   bits: number, multiplicand: bigint, multiplier: bigint,
 *   M: string, initialQ: string,
 *   steps: Array<object>,           // steps[0] is the initial state
 *   product: bigint, productBits: string,
 *   expected: bigint, matches: boolean // cross-check only, never used to build steps
 * }}
 */
export function runBooth(multiplicand, multiplier, bits) {
  const check = validateBoothInputs(multiplicand, multiplier, bits);
  if (!check.valid) throw new RangeError(Object.values(check.errors).join(' '));

  const n = BigInt(bits);
  const mask = (1n << n) - 1n;

  const M = multiplicand & mask; // two's complement pattern of the multiplicand
  const mSigned = signed(M, bits);
  let A = 0n;
  let Q = multiplier & mask;
  let Qm1 = 0n;

  const steps = [
    {
      step: 0,
      type: 'init',
      A: bin(A, bits),
      Q: bin(Q, bits),
      Qm1: String(Qm1),
      explanation: `Initialise: A = ${bin(A, bits)}, Q = ${bin(Q, bits)} (the multiplier), Q−1 = 0, M = ${bin(M, bits)} (the multiplicand). ${bits} iterations follow, one per multiplier bit.`,
    },
  ];

  for (let i = 1; i <= bits; i += 1) {
    const q0 = Q & 1n;
    const pair = `${q0}${Qm1}`;
    const before = { A: bin(A, bits), Q: bin(Q, bits), Qm1: String(Qm1) };

    // --- Step 1: add or subtract the multiplicand (signed, no wrap-around) ---
    const aSigned = signed(A, bits);
    let sum = aSigned;
    let op = 'shift';
    if (pair === '01') {
      sum = aSigned + mSigned;
      op = 'add';
    } else if (pair === '10') {
      sum = aSigned - mSigned;
      op = 'sub';
    }
    const { min, max } = signedRange(bits);
    const overflow = sum < min || sum > max;
    const afterOpWidth = overflow ? bits + 1 : bits;
    const afterOp = bin(sum, afterOpWidth);

    // --- Step 2: arithmetic right shift of [A | Q | Q-1] ---
    const newQm1 = Q & 1n;
    const newQ = (Q >> 1n) | ((sum & 1n) << (n - 1n)); // lowest bit of A enters Q
    const newA = sum >> 1n; // BigInt >> is arithmetic: the sign bit is preserved
    A = newA & mask;
    Q = newQ;
    Qm1 = newQm1;

    let detail = EXPLAIN[pair];
    if (op === 'add') {
      detail += ` A = ${before.A} + ${bin(M, bits)} = ${afterOp}.`;
    } else if (op === 'sub') {
      detail += ` A = ${before.A} − ${bin(M, bits)} = ${afterOp}.`;
    }
    if (overflow) {
      detail += ` The result needs ${bits + 1} bits, so the extra sign bit is kept for the shift.`;
    }
    detail += ' Then A, Q and Q−1 shift right by one place, keeping the sign bit of A.';

    steps.push({
      step: i,
      type: 'iteration',
      before,
      q0: String(q0),
      qm1: before.Qm1,
      pair,
      op,
      opLabel: op === 'add' ? 'A = A + M, shift' : op === 'sub' ? 'A = A − M, shift' : 'Shift only',
      afterOp,
      overflow,
      A: bin(A, bits),
      Q: bin(Q, bits),
      Qm1: String(Qm1),
      explanation: detail,
    });
  }

  // The 2n-bit product sits in [A | Q].
  const productBits = bin(A, bits) + bin(Q, bits);
  const product = fromTwosComplement(productBits);
  const expected = multiplicand * multiplier; // cross-check only
  return {
    bits,
    multiplicand,
    multiplier,
    M: bin(M, bits),
    initialQ: toTwosComplement(multiplier, bits),
    steps,
    product,
    productBits,
    expected,
    matches: expected === product,
  };
}
