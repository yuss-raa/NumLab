/**
 * arithmetic.js
 * ----------------------------------------------------------------------------
 * Addition, subtraction and multiplication on BigInt values, plus a helper that
 * parses two operands written in different number systems.
 */
import { validateNumber } from './numberSystems.js';

export const OPERATIONS = [
  { id: 'add', label: 'Addition (+)', symbol: '+' },
  { id: 'sub', label: 'Subtraction (−)', symbol: '−' },
  { id: 'mul', label: 'Multiplication (×)', symbol: '×' },
];

export const getOperation = (id) => OPERATIONS.find((o) => o.id === id) ?? OPERATIONS[0];

/** Apply an operation to two BigInts. */
export function calculate(a, b, operation) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'sub':
      return a - b;
    case 'mul':
      return a * b;
    default:
      throw new Error(`Unknown operation "${operation}".`);
  }
}

/**
 * Parse both operands (each in its own number system) and compute the result.
 *
 * @returns {{ok: true, a: bigint, b: bigint, result: bigint}
 *         | {ok: false, errors: {a?: string, b?: string}}}
 */
export function evaluate({ aText, aRadix, bText, bRadix, operation }) {
  const a = validateNumber(aText, aRadix);
  const b = validateNumber(bText, bRadix);

  if (!a.valid || !b.valid) {
    const errors = {};
    if (!a.valid) errors.a = a.error;
    if (!b.valid) errors.b = b.error;
    return { ok: false, errors };
  }
  return { ok: true, a: a.value, b: b.value, result: calculate(a.value, b.value, operation) };
}
