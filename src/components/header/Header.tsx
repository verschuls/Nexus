import { useRef, type FC } from "react";
import { useGlassLight } from "../../hooks/useGlassLight";
import { Brand } from "./Brand";
import { MediumChips, OrderToggle, TierChips } from "./Filters";
import { SearchBar } from "./SearchBar";
import type { HeaderProps } from "./types";
import { Watched } from "./Watched";

export const Header: FC<HeaderProps> = (p) => {
  const activeFilters = p.mediums.size + p.tiers.size;
  const ref = useRef<HTMLElement>(null);
  useGlassLight(ref);
  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-white/6 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-350 flex-wrap items-center gap-3 px-5 py-4">
        <Brand className="h-14" />

        <SearchBar {...p} activeFilters={activeFilters} className="h-14 min-w-55 flex-1" />

        {/* order + watched — one container, split between */}
        <div className="glass ml-auto flex h-14 items-center gap-3 rounded-card px-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-fg-3">Order</span>
            <OrderToggle {...p} />
          </div>
          <div className="h-8 w-px bg-white/10" />
          <Watched {...p} />
        </div>
      </div>

      {/* collapsible filters panel — tier row, then medium row */}
      <div
        className={`mx-auto grid max-w-350 px-5 transition-[grid-template-rows,opacity] duration-300 ease-out ${
          p.filtersOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-row gap-3 pb-4">
            <div className="glass flex flex-wrap items-center gap-1 rounded-card px-3 py-2">
              <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-fg-3">Tier</span>
              <TierChips {...p} />
            </div>

            <div className="glass ml-auto flex flex-wrap items-center gap-1 rounded-card px-3 py-2">
              <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-fg-3">Medium</span>
              <MediumChips {...p} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
