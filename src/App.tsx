import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "./components/EmptyState";
import { EntryCard } from "./components/entry/EntryCard";
import { EntryModal } from "./components/entry/EntryModal";
import type { InfoTarget } from "./components/entry/describe";
import { Footer } from "./components/Footer";
import { Header } from "./components/header/Header";
import { HeaderMobile } from "./components/header/HeaderMobile";
import { ResetNotice } from "./components/ResetNotice";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { usePersistentSet } from "./hooks/usePersistentSet";
import { CATEGORIES, items as ALL_ITEMS, seasonTier } from "./lib/catalog";
import {
  FILTERS_KEY,
  MEDIUMS_KEY,
  TIERS_KEY,
  WATCHED_KEY,
  WATCHED_ORDER_KEY,
  loadOpen,
  loadSort,
  save,
  saveSort,
  watchedWasReset,
} from "./lib/storage";
import { timeline, unitKey } from "./lib/timeline";
import type { Category, Item, SortMode } from "./lib/types";

const TOTAL = ALL_ITEMS.length;

/** Search hits title, description or id (and, for a season run, episode titles). */
function matches(item: Item, q: string): boolean {
  return (
    item.data.title.toLowerCase().includes(q) ||
    item.data.description.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  );
}

export default function App() {
  // Saved mediums are filtered so a retired one (one-shots) can't hide everything.
  const [mediums, toggleMedium, clearMediums] = usePersistentSet<Category>(MEDIUMS_KEY, (c) => CATEGORIES.includes(c));
  const [tiers, toggleTier, clearTiers] = usePersistentSet<string>(TIERS_KEY);
  // Release view toggles by show id; chronological view by unit key.
  const [watched, onToggle] = usePersistentSet<string>(WATCHED_KEY);
  const [watchedOrder, onToggleOrder] = usePersistentSet<string>(WATCHED_ORDER_KEY);

  const [sort, setSort] = useState<SortMode>(loadSort);
  const [filtersOpen, setFiltersOpen] = useState(() => loadOpen(FILTERS_KEY, true));
  const [query, setQuery] = useState("");
  const [showResetNotice, setShowResetNotice] = useState(watchedWasReset);
  const [info, setInfo] = useState<InfoTarget | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveSort(sort), [sort]);
  useEffect(() => save(FILTERS_KEY, filtersOpen ? "open" : "closed"), [filtersOpen]);
  const toggleFilters = useCallback(() => setFiltersOpen((v) => !v), []);

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

  // Filtering runs against the deferred value so typing never blocks on the list.
  const deferredQuery = useDeferredValue(query);
  const usesUnits = sort !== "release";
  const allMediums = mediums.size === 0;
  const allTiers = tiers.size === 0;

  // Only the list for the current order is computed.
  const whole = useMemo(() => {
    if (usesUnits) return [];
    const q = deferredQuery.trim().toLowerCase();
    return ALL_ITEMS.filter(
      (it) =>
        (allMediums || mediums.has(it.category)) &&
        (allTiers || tiers.has(it.data.tier)) &&
        (!q || matches(it, q)),
    );
  }, [usesUnits, mediums, tiers, allMediums, allTiers, deferredQuery]);

  const units = useMemo(() => {
    if (!usesUnits) return [];
    const q = deferredQuery.trim().toLowerCase();
    return timeline.filter(
      (u) =>
        (allMediums || mediums.has(u.item.category)) &&
        (allTiers || tiers.has(seasonTier(u.item.data, u.season))) &&
        (!q || matches(u.item, q) || (u.eps?.some((ep) => ep.title.toLowerCase().includes(q)) ?? false)),
    );
  }, [usesUnits, mediums, tiers, allMediums, allTiers, deferredQuery]);

  const count = usesUnits ? units.length : whole.length;
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

      <main className="mx-auto max-w-350 px-5 py-8">
        {count === 0 ? (
          <EmptyState
            query={query}
            onReset={() => {
              setQuery("");
              clearMediums();
              clearTiers();
            }}
          />
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
                      onInfo={setInfo}
                      runSeason={u.season}
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
                    onInfo={setInfo}
                  />
                ))}
          </div>
        )}
      </main>

      <Footer count={count} sort={sort} />

      <EntryModal target={info} onClose={() => setInfo(null)} />
      {showResetNotice && <ResetNotice onClose={() => setShowResetNotice(false)} />}
    </div>
  );
}
