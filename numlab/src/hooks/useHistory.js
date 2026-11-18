import { useCallback, useEffect, useState } from 'react';
import { loadHistory, saveHistory } from '../utils/history.js';

/** Calculation history that persists in localStorage. Newest entries first. */
export function useHistory() {
  const [entries, setEntries] = useState(() => loadHistory());

  // Persist whenever the list changes.
  useEffect(() => {
    saveHistory(entries);
  }, [entries]);

  const add = useCallback((entry) => setEntries((prev) => [entry, ...prev].slice(0, 200)), []);
  const clear = useCallback(() => setEntries([]), []);

  return { entries, add, clear };
}
