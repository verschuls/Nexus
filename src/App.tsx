import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import {
  CATEGORIES,
  categoryLabel,
  itemsByCategory,
  allItems,
  items as ALL_ITEMS,
  timeline,
  timelineSemi,
} from "./data";
import type { Category, SortMode } from "./data";
import { EntryCard, TIERS } from "./EntryCard";
import logo from "./assets/logo.png";
import {
  IconChevron,
  IconClip,
  IconCoffee,
  IconFilm,
  IconGithub,
  IconSearch,
  IconShort,
  IconSliders,
  IconTv,
  type IconProps,
} from "./icons";

const MEDIUM_ICON: Record<Category, FC<IconProps>> = {
  movies: IconFilm,
  series: IconTv,
  oneshots: IconClip,
  shorts: IconShort,
};

const SORTS: { key: SortMode; label: string }[] = [
  { key: "chrono", label: "In-universe" },
  { key: "semi", label: "Semi-chrono" },
  { key: "release", label: "Release" },
];

const TOTAL = ALL_ITEMS.length;
// Static per-medium / per-tier counts — `items` never changes, so tally once.
const COUNT: Record<Category, number> = {
  movies: itemsByCategory("movies").length,
  series: itemsByCategory("series").length,
  oneshots: itemsByCategory("oneshots").length,
  shorts: itemsByCategory("shorts").length,
};
const TIER_COUNT: Record<string, number> = {};
for (const it of ALL_ITEMS) {
  TIER_COUNT[it.data.tier] = (TIER_COUNT[it.data.tier] ?? 0) + 1;
}

/* Shared toggle/segment styling — one neutral accent, tactile press. */
const pill = (on: boolean) =>
  `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96] ${
    on
      ? "border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-200"
  }`;
const seg = (on: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.96] ${
    on
      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "text-zinc-500 hover:text-zinc-200"
  }`;

/* ------------------------------------------------------------------ *
 * Watched state — persisted to localStorage, keyed by unique id
 * ------------------------------------------------------------------ */
const WATCHED_KEY = "nexus:watched"; // release view — keyed by show id
const WATCHED_CHRONO_KEY = "nexus:watched-chrono"; // in-universe view — keyed by chrono order
const WATCHED_SEMI_KEY = "nexus:watched-semi"; // semi-chrono view — keyed by semi order
function loadSet<T extends string | number>(key: string): Set<T> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as T[]) : []);
  } catch {
    return new Set();
  }
}

export default function App() {
  const [mediums, setMediums] = useState<Set<Category>>(new Set());
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>("chrono");
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(WATCHED_KEY));
  const [watchedChrono, setWatchedChrono] = useState<Set<number>>(() => loadSet(WATCHED_CHRONO_KEY));
  const [watchedSemi, setWatchedSemi] = useState<Set<number>>(() => loadSet(WATCHED_SEMI_KEY));
  const [collapsed, setCollapsed] = useState(false);

  // Filtering runs against the deferred value so typing never blocks on the list.
  const deferredQuery = useDeferredValue(query);

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
    const o = Number(key);
    setWatchedChrono((prev) => {
      const next = new Set(prev);
      next.has(o) ? next.delete(o) : next.add(o);
      return next;
    });
  }, []);
  const onToggleSemi = useCallback((key: string | number) => {
    const o = Number(key);
    setWatchedSemi((prev) => {
      const next = new Set(prev);
      next.has(o) ? next.delete(o) : next.add(o);
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

  // Fold classes — collapse on mobile when toggled, always open on md+.
  const foldRows = collapsed
    ? "grid-rows-[0fr] opacity-0 md:grid-rows-[1fr] md:opacity-100"
    : "grid-rows-[1fr] opacity-100";
  const foldPE = collapsed ? "max-md:pointer-events-none" : "";

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-200">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-col px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Nexus"
              draggable={false}
              className="h-8 w-8 shrink-0 select-none"
            />
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-50">NEXUS</h1>
              <p className="text-xs text-zinc-500">
                MCU timeline · watched{" "}
                <span className="font-mono text-emerald-400">{watchedNum}</span>
                <span className="font-mono">/{totalNum}</span>
              </p>
            </div>

            <a
              href="https://github.com/verschuls/nexus"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/25 hover:text-white active:scale-[0.94] md:ml-2"
            >

              <IconGithub className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
              aria-label="Toggle filters"
              className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-white/25 hover:text-white active:scale-[0.94] md:hidden"
            >
              <IconSliders className="h-4 w-4" />
              <IconChevron className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
            </button>
          </div>

          <div className={`grid w-full transition-[grid-template-rows,opacity] duration-300 ease-out md:w-72 ${foldRows}`}>
            <div className={`min-h-0 overflow-hidden ${foldPE}`}>
              <label className="relative mt-3 block w-full md:mt-0">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, id, episode…"
                  className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-white/25 focus:bg-white/[0.05]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* filters + sort (folds on mobile scroll) */}
        <div className={`mx-auto grid max-w-[1400px] px-5 transition-[grid-template-rows,opacity] duration-300 ease-out ${foldRows}`}>
          <div className={`flex min-h-0 flex-col gap-3 overflow-hidden pb-4 ${foldPE}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wider text-zinc-600 sm:inline">
                Show
              </span>
              <button type="button" aria-pressed={allMediums} onClick={clearMediums} className={pill(allMediums)}>
                All
                <span className="font-mono text-xs text-zinc-500">{TOTAL}</span>
              </button>
              {CATEGORIES.map((c) => {
                const Icon = MEDIUM_ICON[c];
                const on = mediums.has(c);
                return (
                  <button key={c} type="button" aria-pressed={on} onClick={() => toggleMedium(c)} className={pill(on)}>
                    <Icon className="h-4 w-4" />
                    {categoryLabel(c)}
                    <span className="font-mono text-xs text-zinc-500">{COUNT[c]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Sort</span>
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={sort === s.key}
                    onClick={() => setSort(s.key)}
                    className={seg(sort === s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* tier filters — active pill tinted with the tier's own hex */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden text-[11px] font-medium uppercase tracking-wider text-zinc-600 sm:inline">
              Tier
            </span>
            <button type="button" aria-pressed={allTiers} onClick={clearTiers} className={pill(allTiers)}>
              All
              <span className="font-mono text-xs text-zinc-500">{TOTAL}</span>
            </button>
            {TIERS.map((t) => {
              const on = tiers.has(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTier(t.key)}
                  style={on ? { color: t.color, backgroundColor: `${t.color}1f`, borderColor: `${t.color}3d` } : undefined}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96] ${
                    on ? "" : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-200"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                  <span className="font-mono text-xs text-zinc-500">{TIER_COUNT[t.key] ?? 0}</span>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </header>

      {/* content */}
      <main className="mx-auto max-w-[1400px] px-5 py-8">
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
              ? units.map((u) => (
                  <EntryCard
                    key={u.order}
                    item={u.item}
                    index={u.order - 1}
                    watched={unitWatched.has(u.order)}
                    toggleKey={u.order}
                    onToggle={unitToggle}
                    runSeason={u.season}
                    runEps={u.eps}
                  />
                ))
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

      <footer className="mx-auto max-w-[1400px] px-5 pb-12 pt-4">
        <p className="text-center font-mono text-[11px] text-zinc-700">
          {count} {count === 1 ? "entry" : "entries"} ·{" "}
          {sort === "chrono"
            ? "in-universe watch order"
            : sort === "semi"
              ? "semi-chronological order"
              : "release order"}
        </p>

        <div className="mx-auto my-6 h-px w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

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
    </div>
  );
}
