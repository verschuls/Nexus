import { useCallback, useEffect, useState } from "react";
import { loadSet, save } from "../lib/storage";

/** A Set kept in localStorage under `key`. `keep` drops stale saved values
 * (e.g. a filter whose option no longer exists). Toggle/clear are stable, so
 * memoized children don't re-render. */
export function usePersistentSet<T extends string>(key: string, keep?: (v: T) => boolean) {
  const [set, setSet] = useState<Set<T>>(() => {
    const saved = loadSet<T>(key);
    return keep ? new Set([...saved].filter(keep)) : saved;
  });
  useEffect(() => save(key, JSON.stringify([...set])), [key, set]);

  const toggle = useCallback((v: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }, []);
  const clear = useCallback(() => setSet(new Set()), []);
  return [set, toggle, clear] as const;
}
