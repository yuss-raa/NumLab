/**
 * numberSystems.js
 * ----------------------------------------------------------------------------
 * Reusable number-system helpers for NumLab.
 *
 * Every integer in the application is a BigInt, so values never lose precision
 * (JavaScript Numbers are only exact up to 2^53 - 1).
 *
 * Text input is NEVER treated as a decimal string and then reinterpreted:
 * each string is validated against its own radix and parsed with that radix.
 */

/** The four supported number systems. `radix` is the numeric base. */
export const NUMBER_SYSTEMS = [
  { id: 'bin', label: 'Binary', radix: 2, prefix: '0b', digits: '0 and 1', example: '1011' },
  { id: 'oct', label: 'Octal', radix: 8, prefix: '0o', digits: '0 to 7', example: '755' },
  { id: 'dec', label: 'Decimal', radix: 10, prefix: '', digits: '0 to 9', example: '-42' },
  { id: 'hex', label: 'Hexadecimal', radix: 16, prefix: '0x', digits: '0 to 9 and A to F', example: 'A3' },
];

export const getSystem = (id) => NUMBER_SYSTEMS.find((s) => s.id === id) ?? NUMBER_SYSTEMS[2];

const DIGIT_PATTERNS = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

/**
 * Validate and parse a text value written in the given radix.
 *
 * Accepts an optional leading sign (+ or -), an optional matching prefix
 * (0b, 0o, 0x) and ignores spaces/underscores used for digit grouping.
 *
 * @param {string} input
 * @param {2|8|10|16} radix
 * @returns {{valid: true, value: bigint} | {valid: false, error: string}}
 */
export function validateNumber(input, radix) {
  const system = NUMBER_SYSTEMS.find((s) => s.radix === radix);
  if (!system) return { valid: false, error: `Unsupported base ${radix}.` };

  let text = String(input ?? '').replace(/[\s_]/g, '');
  if (text === '') return { valid: false, error: 'Enter a value.' };

  let negative = false;
  if (text[0] === '+' || text[0] === '-') {
    negative = text[0] === '-';
    text = text.slice(1);
  }

  if (system.prefix && text.toLowerCase().startsWith(system.prefix)) {
    text = text.slice(system.prefix.length);
  }
  if (text === '') return { valid: false, error: 'Enter at least one digit.' };

  if (!DIGIT_PATTERNS[radix].test(text)) {
    const bad = [...text].find((ch) => !DIGIT_PATTERNS[radix].test(ch));
    return {
      valid: false,
      error: `"${bad}" is not a valid ${system.label.toLowerCase()} digit. Use ${system.digits}.`,
    };
  }

  // BigInt('0b1010'), BigInt('0o17') and BigInt('0xA3') parse in their own base.
  const literal = radix === 10 ? text : `${system.prefix}${text}`;
  const magnitude = BigInt(literal);
  return { valid: true, value: negative ? -magnitude : magnitude };
}

/** Format a BigInt in the given radix (upper-case, '-' for negatives). */
export function bigintToString(value, radix) {
  const n = BigInt(value);
  const text = (n < 0n ? -n : n).toString(radix).toUpperCase();
  return n < 0n ? `-${text}` : text;
}

/** Return the value in all four supported systems. */
export function convertAll(value) {
  return {
    bin: bigintToString(value, 2),
    oct: bigintToString(value, 8),
    dec: bigintToString(value, 10),
    hex: bigintToString(value, 16),
  };
}

/* ----------------------------------------------------------------------------
 * Named conversion helpers
 * -------------------------------------------------------------------------- */

/** Binary text -> BigInt. A leading '-' is honoured; otherwise unsigned. */
export function binaryToDecimal(bin) {
  const result = validateNumber(bin, 2);
  if (!result.valid) throw new SyntaxError(result.error);
  return result.value;
}

/** BigInt (or decimal text) -> binary text, with '-' for negatives. */
export function decimalToBinary(dec) {
  const value = typeof dec === 'bigint' ? dec : BigInt(dec);
  return bigintToString(value, 2);
}

/**
 * Convert a binary string to a power-of-two base by grouping bits.
 * Octal groups 3 bits, hexadecimal groups 4 bits. This mirrors how the
 * conversion is done by hand and in hardware (no division needed).
 */
function binaryToGrouped(bin, groupSize, digitsRadix) {
  const negative = bin.startsWith('-');
  const bits = negative ? bin.slice(1) : bin;
  if (!/^[01]+$/.test(bits)) throw new SyntaxError('Binary values may only contain 0 and 1.');

  const padded = bits.padStart(Math.ceil(bits.length / groupSize) * groupSize, '0');
  let out = '';
  for (let i = 0; i < padded.length; i += groupSize) {
    out += parseInt(padded.slice(i, i + groupSize), 2).toString(digitsRadix).toUpperCase();
  }
  out = out.replace(/^0+(?=.)/, ''); // trim leading zeros but keep a single 0
  return negative ? `-${out}` : out;
}

export const binaryToOctal = (bin) => binaryToGrouped(bin, 3, 8);
export const binaryToHex = (bin) => binaryToGrouped(bin, 4, 16);

/** Hexadecimal text -> BigInt. */
export function hexToDecimal(hex) {
  const result = validateNumber(hex, 16);
  if (!result.valid) throw new SyntaxError(result.error);
  return result.value;
}

/** Octal text -> BigInt. */
export function octalToDecimal(oct) {
  const result = validateNumber(oct, 8);
  if (!result.valid) throw new SyntaxError(result.error);
  return result.value;
}

/* ----------------------------------------------------------------------------
 * Signed two's complement
 * -------------------------------------------------------------------------- */

/** Number of bits needed to write |value| in binary (0 -> 0). */
export const bitLength = (value) => (value === 0n ? 0 : (value < 0n ? -value : value).toString(2).length);

/** Smallest signed width that can hold `value` in two's complement. */
export function bitsNeeded(value) {
  const v = BigInt(value);
  return (v >= 0n ? bitLength(v) : bitLength(-v - 1n)) + 1;
}

/** Inclusive range of an n-bit signed integer. */
export function signedRange(bits) {
  const n = BigInt(bits);
  return { min: -(1n << (n - 1n)), max: (1n << (n - 1n)) - 1n };
}

export function fitsInBits(value, bits) {
  const { min, max } = signedRange(bits);
  return value >= min && value <= max;
}

/**
 * Signed integer -> two's complement bit string of exactly `bits` characters.
 * @throws {RangeError} when the value does not fit.
 */
export function toTwosComplement(value, bits) {
  const v = BigInt(value);
  if (!fitsInBits(v, bits)) {
    const { min, max } = signedRange(bits);
    throw new RangeError(`${v} does not fit in ${bits} bits (range ${min} to ${max}).`);
  }
  const mask = (1n << BigInt(bits)) - 1n;
  // BigInt bitwise AND treats negatives as infinite two's complement.
  return (v & mask).toString(2).padStart(bits, '0');
}

/** Two's complement bit string -> signed BigInt (width = string length). */
export function fromTwosComplement(bin) {
  if (!/^[01]+$/.test(bin)) throw new SyntaxError('Expected a string of 0s and 1s.');
  const raw = BigInt(`0b${bin}`);
  return bin[0] === '1' ? raw - (1n << BigInt(bin.length)) : raw;
}

/** Insert a space every `size` characters, counting from the right. */
export function groupBits(text, size = 4) {
  const negative = text.startsWith('-');
  const body = negative ? text.slice(1) : text;
  const chunks = [];
  for (let end = body.length; end > 0; end -= size) {
    chunks.unshift(body.slice(Math.max(0, end - size), end));
  }
  return (negative ? '-' : '') + chunks.join(' ');
}
