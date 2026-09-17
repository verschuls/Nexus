import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { items as ALL_ITEMS, timeline, unitKey } from "./data";
import type { Category, SortMode } from "./data";
import { EntryCard } from "./EntryCard";
import { Header } from "./Header";
import { HeaderMobile } from "./HeaderMobile";
import { useMediaQuery } from "./useMediaQuery";
import { IconCoffee, IconSearch } from "./icons";

const TOTAL = ALL_ITEMS.length;

/* ------------------------------------------------------------------ *
 * Watched state — persisted to localStorage, keyed by unique id
 * ------------------------------------------------------------------ */
const WATCHED_KEY = "nexus:watched"; // release view — keyed by show id
// Chronological view — keyed by unitKey. The storage string is deliberately still
// the old "-semi" one: this order WAS semi-chrono before the rename, so reusing
// the key carries existing progress over instead of orphaning it.
const WATCHED_ORDER_KEY = "nexus:watched-semi";
const DEAD_CHRONO_KEY = "nexus:watched-chrono"; // retired in-universe order — cleared on load
const FILTERS_KEY = "nexus:filters-open"; // filter panel open/closed, remembered across reloads
const MEDIUMS_KEY = "nexus:mediums"; // selected medium filters
const TIERS_KEY = "nexus:tiers"; // selected tier filters
const SORT_KEY = "nexus:sort"; // selected ordering
function loadSet<T extends string | number>(key: string): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as T[]) : []);
  } catch {
    return new Set();
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/** Only ever returns a SortMode that still exists — a retired one (the in-universe
 * order, dropped 2026-09-16) must not come back to life out of an old session. */
function loadSort(): SortMode {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    return raw === "release" || raw === "chrono" ? raw : "chrono";
  } catch {
    return "chrono";
  }
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
const watchedWasReset = migrateWatchedSchema();

export default function App() {
  const [mediums, setMediums] = useState<Set<Category>>(() => loadSet(MEDIUMS_KEY));
  const [tiers, setTiers] = useState<Set<string>>(() => loadSet(TIERS_KEY));
  const [sort, setSort] = useState<SortMode>(loadSort);
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(WATCHED_KEY));
  const [watchedOrder, setWatchedOrder] = useState<Set<string>>(() => loadSet(WATCHED_ORDER_KEY));
  const [showResetNotice, setShowResetNotice] = useState(watchedWasReset);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(FILTERS_KEY) !== "closed"; // default open
    } catch {
      return true;
    }
  });
  const searchRef = useRef<HTMLInputElement>(null);

  // Filtering runs against the deferred value so typing never blocks on the list.
  const deferredQuery = useDeferredValue(query);

  // "/" focuses search (unless already typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => save(WATCHED_KEY, JSON.stringify([...watched])), [watched]);
  useEffect(() => save(WATCHED_ORDER_KEY, JSON.stringify([...watchedOrder])), [watchedOrder]);
  useEffect(() => save(FILTERS_KEY, filtersOpen ? "open" : "closed"), [filtersOpen]);
  useEffect(() => save(MEDIUMS_KEY, JSON.stringify([...mediums])), [mediums]);
  useEffect(() => save(TIERS_KEY, JSON.stringify([...tiers])), [tiers]);
  useEffect(() => save(SORT_KEY, sort), [sort]);

  const toggleFilters = useCallback(() => setFiltersOpen((v) => !v), []);

  // Stable identities so memoized EntryCards don't re-render on every keystroke.
  // Release view toggles by show id; chronological view toggles by unit key.
  const onToggle = useCallback((key: string | number) => {
    const id = String(key);
    setWatched((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const onToggleOrder = useCallback((key: string | number) => {
    const k = String(key);
    setWatchedOrder((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }, []);
  const toggleMedium = useCallback((c: Category) => {
    setMediums((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }, []);
  const clearMediums = useCallback(() => setMediums(new Set()), []);
  const toggleTier = useCallback((t: string) => {
    setTiers((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }, []);
  const clearTiers = useCallback(() => setTiers(new Set()), []);

  const usesUnits = sort !== "release"; // chronological renders season/episode runs
  const allMediums = mediums.size === 0;
  const allTiers = tiers.size === 0;

  // Whole-show list (release order).
  const whole = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const allM = mediums.size === 0;
    const allT = tiers.size === 0;
    return ALL_ITEMS.filter(
      (it) =>
        (allM || mediums.has(it.category)) &&
        (allT || tiers.has(it.data.tier)) &&
        (!q ||
          it.data.title.toLowerCase().includes(q) ||
          it.data.description.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)),
    );
  }, [mediums, tiers, deferredQuery]);

  // Watch-order rows: the chronological timeline.
  const units = useMemo(() => {
    if (sort === "release") return [];
    const q = deferredQuery.trim().toLowerCase();
    const allM = mediums.size === 0;
    const allT = tiers.size === 0;
    return timeline.filter(
      (u) =>
        (allM || mediums.has(u.item.category)) &&
        (allT || tiers.has(u.item.data.tier)) &&
        (!q ||
          u.item.data.title.toLowerCase().includes(q) ||
          u.item.data.description.toLowerCase().includes(q) ||
          u.item.id.toLowerCase().includes(q) ||
          (u.eps?.some((ep) => ep.title.toLowerCase().includes(q)) ?? false)),
    );
  }, [sort, mediums, tiers, deferredQuery]);

  const count = usesUnits ? units.length : whole.length;
  const isEmpty = count === 0;

  // Watched is tracked per timeline unit in chronological, per show id in release.
  const watchedNum = usesUnits ? watchedOrder.size : watched.size;
  const totalNum = usesUnits ? timeline.length : TOTAL;

  const watchPct = totalNum ? Math.round((watchedNum / totalNum) * 100) : 0;

  // One header mounts at a time (shared searchRef / "/" hotkey), swapped by viewport.
  const isMobile = useMediaQuery("(max-width: 767px)");
  const HeaderComp = isMobile ? HeaderMobile : Header;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200">
      <HeaderComp
        query={query}
        setQuery={setQuery}
        searchRef={searchRef}
        filtersOpen={filtersOpen}
        onToggleFilters={toggleFilters}
        mediums={mediums}
        tiers={tiers}
        allMediums={allMediums}
        allTiers={allTiers}
        clearMediums={clearMediums}
        toggleMedium={toggleMedium}
        clearTiers={clearTiers}
        toggleTier={toggleTier}
        sort={sort}
        setSort={setSort}
        total={TOTAL}
        watchedNum={watchedNum}
        totalNum={totalNum}
        watchPct={watchPct}
      />

      {/* content */}
      <main className="mx-auto max-w-350 px-5 py-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <IconSearch className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-400">
              {query ? <>No entries match “{query}”.</> : "No entries for the selected filters."}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                clearMediums();
                clearTiers();
              }}
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:text-white active:scale-[0.98]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {usesUnits
              ? units.map((u) => {
                  const k = unitKey(u);
                  return (
                    <EntryCard
                      key={u.order}
                      item={u.item}
                      index={u.order - 1}
                      watched={watchedOrder.has(k)}
                      toggleKey={k}
                      onToggle={onToggleOrder}
                      runSeason={u.season}
                      runEps={u.eps}
                    />
                  );
                })
              : whole.map((item, i) => (
                  <EntryCard
                    key={`${item.category}/${item.id}`}
                    item={item}
                    index={i}
                    watched={watched.has(item.id)}
                    toggleKey={item.id}
                    onToggle={onToggle}
                  />
                ))}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-350 px-5 pb-12 pt-4">
        <p className="text-center font-mono text-[11px] text-zinc-700">
          {count} {count === 1 ? "entry" : "entries"} ·{" "}
          {sort === "chrono" ? "chronological order" : "release order"}
        </p>

        <div className="mx-auto my-6 h-px w-16 bg-linear-to-r from-transparent via-white/15 to-transparent" />

        <div className="flex flex-col items-center gap-2.5">
          <p className="flex items-center gap-1.5 text-sm text-zinc-400">
            Made by
            <a
              href="https://verschuls.xyz"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-zinc-100 transition-[color,text-shadow] duration-200 hover:text-white hover:[text-shadow:0_0_12px_rgba(255,255,255,0.5)]"
            >
              Verschuls
            </a>
            with
            <IconCoffee className="h-4 w-4 text-amber-500/90" />
          </p>

          <p className="text-xs text-zinc-500">
            Data &amp; timeline courtesy of{" "}
            <a
              href="https://marvelcinematicuniverse.fandom.com"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400/80 underline-offset-2 transition-colors hover:text-sky-300 hover:underline"
            >
              the MCU Fandom Wiki
            </a>
          </p>

          <p className="max-w-md text-center text-[11px] leading-relaxed text-zinc-600">
            Not affiliated with, endorsed by, or associated with Marvel, the MCU, or Fandom.
            All trademarks and content belong to their respective owners.
          </p>
        </div>
      </footer>

      {showResetNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowResetNotice(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-zinc-50">Watch progress reset</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              The watch-order data changed, so your chronological progress was cleared.
              Release-order progress is untouched — and thanks to a saving change, this
              won’t happen again.
            </p>
            <button
              type="button"
              onClick={() => setShowResetNotice(false)}
              className="mt-5 w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
