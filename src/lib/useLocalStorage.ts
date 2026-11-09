'use client';

import { useEffect, useState } from 'react';

// `sanitize` normalizes whatever JSON is already on disk before it becomes state.
// Besides guarding against hand-edited or stale shapes, it's how fields that used to
// be persisted get purged: the sanitized value is written straight back on hydration,
// so dropping a key here also erases it from the user's browser on their next visit.
export function useLocalStorage<T>(key: string, initialValue: T, sanitize?: (stored: unknown) => T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        setValue(sanitize ? sanitize(parsed) : (parsed as T));
      }
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
    // `sanitize` is intentionally not a dependency — callers pass an inline function,
    // and re-running this effect would clobber in-session edits with the stored value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write failures (e.g. private browsing quota)
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
