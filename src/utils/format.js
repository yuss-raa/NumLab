/**
 * format.js - small display helpers shared by several pages.
 */

/** Unicode subscripts used to label the base of a written number. */
export const SUBSCRIPT = { bin: '₂', oct: '₈', dec: '₁₀', hex: '₁₆' };

/** "A3" + "hex" -> "A3₁₆" */
export const withBase = (text, systemId) => `${text}${SUBSCRIPT[systemId] ?? ''}`;

/** One-line description of a history entry, e.g. "A3₁₆ + 1011₂". */
export const describeEntry = (entry) =>
  `${withBase(entry.a.text, entry.a.system)} ${entry.symbol ?? '×'} ${withBase(entry.b.text, entry.b.system)}`;
