import { useCallback, useEffect, useState } from 'react';

const KEY = 'numlab.theme';

/** Saved choice, else the page's own data-theme, else the system setting. */
function initialTheme() {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* storage blocked: fall through */
  }
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Light/dark theme. The choice is applied as data-theme on <html> so CSS can react. */
export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(KEY, next); // only an explicit choice is remembered
      } catch {
        /* storage blocked: the choice still applies for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
