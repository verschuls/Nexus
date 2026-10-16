// localStorage keys and helpers. Every access is wrapped: private mode or a
// full quota must never break the app.
import type { SortMode } from "./types";

export const WATCHED_KEY = "nexus:watched"; // release view — keyed by show id
// Chronological view — keyed by unitKey. The storage string is deliberately still
// the old "-semi" one: this order WAS semi-chrono before the rename, so reusing
// the key carries existing progress over instead of orphaning it.
export const WATCHED_ORDER_KEY = "nexus:watched-semi";
const DEAD_CHRONO_KEY = "nexus:watched-chrono"; // retired in-universe order — cleared on load
export const FILTERS_KEY = "nexus:filters-open"; // filter panel open/closed, remembered across reloads
export const MEDIUMS_KEY = "nexus:mediums"; // selected medium filters
export const TIERS_KEY = "nexus:tiers"; // selected tier filters
const SORT_KEY = "nexus:sort"; // selected ordering

export function loadSet<T extends string | number>(key: string): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as T[]) : []);
  } catch {
    return new Set();
  }
}

export function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Only ever returns a SortMode that still exists — a retired one (the in-universe
 * order, dropped 2026-09-16) must not come back to life out of an old session. */
export function loadSort(): SortMode {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    return raw === "release" || raw === "chrono" ? raw : "chrono";
  } catch {
    return "chrono";
  }
}

export function saveSort(sort: SortMode) {
  save(SORT_KEY, sort);
}

const SCHEMA_KEY = "nexus:schema"; // bumped when the watched key format changes
const WATCHED_SCHEMA = 2; // v1 = watch order keyed by `order` int; v2 = keyed by stable unitKey

// Runs once on load. Always drops the retired in-universe set, and for v1
// visitors also clears the watch-order set (it keyed off the volatile `order`
// integer; v2 keys off the stable unitKey signature, so those values are
// meaningless now). Returns true only when real progress was actually discarded
// (so first-time visitors don't get the notice).
function migrateWatchedSchema(): boolean {
  try {
    localStorage.removeItem(DEAD_CHRONO_KEY);
    if (localStorage.getItem(SCHEMA_KEY) === String(WATCHED_SCHEMA)) return false;
    const saved = localStorage.getItem(WATCHED_ORDER_KEY);
    const hadProgress = !!saved && saved !== "[]";
    localStorage.removeItem(WATCHED_ORDER_KEY);
    localStorage.setItem(SCHEMA_KEY, String(WATCHED_SCHEMA));
    return hadProgress;
  } catch {
    return false;
  }
}
export const watchedWasReset = migrateWatchedSchema();

/** A stored "open"/"closed" flag; missing = `fallback`. */
export function loadOpen(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw ? raw !== "closed" : fallback;
  } catch {
    return fallback;
  }
}
