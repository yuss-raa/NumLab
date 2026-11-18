/**
 * history.js
 * ----------------------------------------------------------------------------
 * Calculation history stored in localStorage (survives page refreshes).
 * Every storage call is wrapped in try/catch because storage can be blocked
 * (private windows, disabled cookies) and must never break the app.
 */
const KEY = 'numlab.history.v1';
const MAX_ENTRIES = 200;

/** @returns {Array<object>} saved entries, newest first */
export function loadHistory() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* storage unavailable: the in-memory list still works */
  }
}

/**
 * Build a history entry. BigInt values are stored as strings because JSON
 * cannot serialise BigInt.
 */
export function createEntry({ kind, operation, symbol, a, b, result }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind, // 'arithmetic' | 'booth'
    operation, // e.g. 'Addition (+)' or 'Booth (8-bit)'
    symbol, // '+', '−' or '×'
    a: { text: a.text, system: a.system },
    b: { text: b.text, system: b.system },
    result: { dec: result.dec, bin: result.bin, oct: result.oct, hex: result.hex },
    timestamp: new Date().toISOString(),
  };
}

export function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
