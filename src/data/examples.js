/**
 * Sample calculations used by the Dashboard and the two calculator pages.
 * `system` values are the ids from NUMBER_SYSTEMS (bin, oct, dec, hex).
 */
export const ARITHMETIC_EXAMPLES = [
  { id: 'a1', label: 'A3₁₆ + 1011₂', aText: 'A3', aSys: 'hex', bText: '1011', bSys: 'bin', op: 'add' },
  { id: 'a2', label: '755₈ × 12₁₀', aText: '755', aSys: 'oct', bText: '12', bSys: 'dec', op: 'mul' },
  { id: 'a3', label: '−45₁₀ − 2F₁₆', aText: '-45', aSys: 'dec', bText: '2F', bSys: 'hex', op: 'sub' },
  { id: 'a4', label: 'FF₁₆ × FF₁₆', aText: 'FF', aSys: 'hex', bText: 'FF', bSys: 'hex', op: 'mul' },
];

export const BOOTH_EXAMPLES = [
  { id: 'b1', label: '7 × 3 (4-bit)', mText: '7', mSys: 'dec', qText: '3', qSys: 'dec', bits: 4 },
  { id: 'b2', label: '−3 × 5 (4-bit)', mText: '-3', mSys: 'dec', qText: '5', qSys: 'dec', bits: 4 },
  { id: 'b3', label: '−12 × −9 (8-bit)', mText: '-12', mSys: 'dec', qText: '-9', qSys: 'dec', bits: 8 },
  { id: 'b4', label: '5A₁₆ × −7 (8-bit)', mText: '5A', mSys: 'hex', qText: '-7', qSys: 'dec', bits: 8 },
];
