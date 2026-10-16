import { CaretDownIcon, MagnifyingGlassIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { Button } from "../ui";
import type { HeaderProps } from "./types";

/* Search field + filters toggle in one glass strip. The toggle shows how many
   filters are on, so a filtered list never looks unexplained. */
export function SearchBar({
  query,
  setQuery,
  searchRef,
  filtersOpen,
  onToggleFilters,
  activeFilters,
  className,
}: Pick<HeaderProps, "query" | "setQuery" | "searchRef" | "filtersOpen" | "onToggleFilters"> & {
  activeFilters: number;
  className?: string;
}) {
  return (
    <div className={`glass flex items-center gap-2 rounded-card p-2 ${className ?? ""}`}>
      <label className="sunken flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-control px-3.5 text-fg-3 focus-within:[--edge:var(--field-edge-focus)]">
        <MagnifyingGlassIcon size={16} className="shrink-0" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, id, episode…"
          aria-label="Search"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg-1 outline-none placeholder:text-fg-3"
        />
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-white/12 border-b-white/6 bg-white/6 px-1.5 font-mono text-[11px] font-medium text-fg-2 shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]">
          /
        </kbd>
      </label>
      <Button onClick={onToggleFilters} aria-expanded={filtersOpen} aria-label="Toggle filters">
        <SlidersHorizontalIcon size={16} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilters > 0 && <span className="font-mono text-xs text-fg-2">{activeFilters}</span>}
        <CaretDownIcon size={14} className={`text-fg-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
      </Button>
    </div>
  );
}
