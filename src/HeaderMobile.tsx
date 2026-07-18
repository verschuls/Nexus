import type { FC } from "react";
import { CATEGORIES, categoryLabel } from "./data";
import { TIERS } from "./EntryCard";
import {
  MEDIUM_ICON,
  SORTS,
  COUNT,
  TIER_COUNT,
  seg,
  filterBtn,
  filterCount,
  type HeaderProps,
} from "./headerShared";
import logo from "./assets/logo.png";
import { IconChevron, IconGithub, IconSearch, IconSliders } from "./icons";

// Mobile-only header. Edit this freely without touching the desktop Header.
export const HeaderMobile: FC<HeaderProps> = ({
  query,
  setQuery,
  searchRef,
  filtersOpen,
  onToggleFilters,
  mediums,
  tiers,
  allMediums,
  allTiers,
  clearMediums,
  toggleMedium,
  clearTiers,
  toggleTier,
  sort,
  setSort,
  total,
  watchedNum,
  totalNum,
  watchPct,
}) => {
  const filtersActive = !allMediums || !allTiers;
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex flex-wrap items-center gap-3 px-5 py-4">
        {/* branding — logo | title | split | github */}
        <div className="flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/2 pl-3 pr-1.5">

          <img src={logo} alt="Nexus" draggable={false} className="h-10 w-10 select-none" />
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight text-zinc-50">NEXUS</h1>
            <p className="mt-1 text-xs text-zinc-500">MCU timeline</p>
          </div>
          <div className="mx-1 h-9 w-px bg-white/10" />
          <a
            href="https://github.com/verschuls/nexus"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="grid -ml-3 h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors hover:text-white active:scale-[0.94]"
          >
            <IconGithub className="h-5 w-5" />
          </a>
        </div>

        {/* watched — bordered container, fills the rest of the row */}
        <div className="flex h-14 min-w-0 flex-1 items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/2 px-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(#34d399 ${watchPct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
          >
            <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-zinc-950 font-mono text-[9px] text-zinc-400">
              {watchPct}%
            </div>
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Watched</p>
            <p className="font-mono text-sm text-zinc-100">
              {watchedNum}
              <span className="text-zinc-500">/{totalNum}</span>
            </p>
          </div>
        </div>

        {/* search | split | filters toggle — one connected container */}
        <div className="flex h-14 w-full items-center rounded-2xl border border-white/10 bg-white/2">
          <label className="relative flex h-full flex-1 items-center">
            <IconSearch className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-600" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, id, episode…"
              className="h-full w-full bg-transparent pl-11 pr-9 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />
            <kbd className="pointer-events-none absolute right-3 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500">
              /
            </kbd>
          </label>
          <div className="h-8 w-px bg-white/10" />
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            aria-label="Toggle filters"
            className={`flex h-full shrink-0 items-center gap-2 rounded-r-2xl px-4 text-sm font-medium transition-colors ${filtersActive ? "text-white" : "text-zinc-300 hover:text-white"}`}
          >
            <IconSliders className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            <IconChevron
              className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""} ${filtersActive ? "text-white" : "text-zinc-500"}`}
            />
          </button>
        </div>

      </div>

      {/* collapsible filters panel — order, then tier/medium rows */}
      <div
        className={`mx-auto grid max-w-350 px-5 transition-[grid-template-rows,opacity] duration-300 ease-out ${
          filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {/* order (sort) — hides together with the filters */}
          <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/2 px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Order</span>
            <div className="inline-flex rounded-2xl bg-white/2 p-1">
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
          <div className="flex flex-row justify-between gap-3 pb-4">
            {/* tier filters */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/2 px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Tier</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={clearTiers} className={filterBtn(allTiers)}>
                  All
                  <span className={filterCount(allTiers)}>{total}</span>
                </button>
                {TIERS.map((t) => {
                  const on = tiers.has(t.key);
                  return (
                    <button key={t.key} type="button" onClick={() => toggleTier(t.key)} className={filterBtn(on)}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                      <span className={filterCount(on)}>{TIER_COUNT[t.key] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* medium (show) filters */}
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/2 px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Medium</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={clearMediums} className={filterBtn(allMediums)}>
                  All
                  <span className={filterCount(allMediums)}>{total}</span>
                </button>
                {CATEGORIES.map((c) => {
                  const Icon = MEDIUM_ICON[c];
                  const on = mediums.has(c);
                  return (
                    <button key={c} type="button" onClick={() => toggleMedium(c)} className={filterBtn(on)}>
                      <Icon className="h-4 w-4" />
                      {categoryLabel(c)}
                      <span className={filterCount(on)}>{COUNT[c]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
