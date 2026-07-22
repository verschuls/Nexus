import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  allItems,
  items as ALL_ITEMS,
  timeline,
  timelineSemi,
  unitKey,
} from "./data";
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
const WATCHED_CHRONO_KEY = "nexus:watched-chrono"; // in-universe view — keyed by chrono order
const WATCHED_SEMI_KEY = "nexus:watched-semi"; // semi-chrono view — keyed by semi order
const FILTERS_KEY = "nexus:filters-open"; // filter panel open/closed, remembered across reloads
function loadSet<T extends string | number>(key: string): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as T[]) : []);
  } catch {
    return new Set();
  }
}

const SCHEMA_KEY = "nexus:schema"; // bumped when the watched key format changes
const WATCHED_SCHEMA = 2; // v1 = chrono/semi keyed by `order` int; v2 = keyed by stable unitKey

// One-time migration: chrono/semi watched used to key off the volatile `order`
// integer. v2 keys off a stable content signature (unitKey), so renumbering the
// timelines no longer wipes progress — but the OLD saved sets are meaningless now,
// so clear them once. Returns true only when real progress was actually discarded
// (so first-time visitors don't get the notice).
function migrateWatchedSchema(): boolean {
  try {
    if (localStorage.getItem(SCHEMA_KEY) === String(WATCHED_SCHEMA)) return false;
    const chrono = localStorage.getItem(WATCHED_CHRONO_KEY);
    const semi = localStorage.getItem(WATCHED_SEMI_KEY);
    const hadProgress = (!!chrono && chrono !== "[]") || (!!semi && semi !== "[]");
    localStorage.removeItem(WATCHED_CHRONO_KEY);
    localStorage.removeItem(WATCHED_SEMI_KEY);
    localStorage.setItem(SCHEMA_KEY, String(WATCHED_SCHEMA));
    return hadProgress;
  } catch {
    return false;
  }
}
const watchedWasReset = migrateWatchedSchema();

export default function App() {
  const [mediums, setMediums] = useState<Set<Category>>(new Set());
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>("chrono");
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(WATCHED_KEY));
  const [watchedChrono, setWatchedChrono] = useState<Set<string>>(() => loadSet(WATCHED_CHRONO_KEY));
  const [watchedSemi, setWatchedSemi] = useState<Set<string>>(() => loadSet(WATCHED_SEMI_KEY));
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

  useEffect(() => {
    try {
      localStorage.setItem(WATCHED_KEY, JSON.stringify([...watched]));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [watched]);
  useEffect(() => {
    try {
      localStorage.setItem(WATCHED_CHRONO_KEY, JSON.stringify([...watchedChrono]));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [watchedChrono]);
  useEffect(() => {
    try {
      localStorage.setItem(WATCHED_SEMI_KEY, JSON.stringify([...watchedSemi]));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [watchedSemi]);
  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, filtersOpen ? "open" : "closed");
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [filtersOpen]);

  const toggleFilters = useCallback(() => setFiltersOpen((v) => !v), []);

  // Stable identities so memoized EntryCards don't re-render on every keystroke.
  // Release view toggles by show id; in-universe view toggles by chrono order.
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
    setWatchedChrono((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  }, []);
  const onToggleSemi = useCallback((key: string | number) => {
    const k = String(key);
    setWatchedSemi((prev) => {
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

  const usesUnits = sort !== "release"; // chrono + semi render episode/season runs
  const allMediums = mediums.size === 0;
  const allTiers = tiers.size === 0;

  // Whole-show list (release order).
  const whole = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const allM = mediums.size === 0;
    const allT = tiers.size === 0;
    return allItems(sort).filter(
      (it) =>
        (allM || mediums.has(it.category)) &&
        (allT || tiers.has(it.data.tier)) &&
        (!q ||
          it.data.title.toLowerCase().includes(q) ||
          it.data.description.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)),
    );
  }, [sort, mediums, tiers, deferredQuery]);

  // Watch-order rows: chrono (episode-interleaved) or semi-chrono (collapsed).
  const units = useMemo(() => {
    const src = sort === "chrono" ? timeline : sort === "semi" ? timelineSemi : null;
    if (!src) return [];
    const q = deferredQuery.trim().toLowerCase();
    const allM = mediums.size === 0;
    const allT = tiers.size === 0;
    return src.filter(
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

  // Watched is tracked per order in chrono/semi, per show id in release.
  const unitWatched = sort === "semi" ? watchedSemi : watchedChrono;
  const unitToggle = sort === "semi" ? onToggleSemi : onToggleOrder;
  const watchedNum = usesUnits ? unitWatched.size : watched.size;
  const totalNum = usesUnits
    ? sort === "semi"
      ? timelineSemi.length
      : timeline.length
    : TOTAL;

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
                      watched={unitWatched.has(k)}
                      toggleKey={k}
                      onToggle={unitToggle}
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
          {sort === "chrono"
            ? "in-universe watch order"
            : sort === "semi"
              ? "semi-chronological order"
              : "release order"}
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
              The watch-order data changed, so your In-universe and Semi-chrono progress was
              cleared. Release-order progress is untouched — and thanks to a saving change, this
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
