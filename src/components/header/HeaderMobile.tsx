import { useEffect, useRef, useState, type FC } from "react";
import { useGlassLight } from "../../hooks/useGlassLight";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Brand } from "./Brand";
import { MediumChips, OrderToggle, TierChips } from "./Filters";
import { SearchBar } from "./SearchBar";
import type { HeaderProps } from "./types";
import { Watched } from "./Watched";

const COLLAPSED_KEY = "nexus:header-collapsed"; // mobile-only, remembered across reloads

// Mobile-only header. Edit this freely without touching the desktop Header.
export const HeaderMobile: FC<HeaderProps> = (p) => {
  const { query, filtersOpen, allMediums, allTiers } = p;
  const filtersActive = !allMediums || !allTiers;

  // Collapse lives here rather than in App: the desktop header has no notch, so
  // lifting it would add props that header ignores, and only one header mounts.
  // It is a LAYER over the panels, never a write into them — the notch hides the
  // header body while `filtersOpen` keeps whatever you last set it to, so expanding
  // restores the exact arrangement you left instead of flinging everything open.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "collapsed";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "collapsed" : "open");
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [collapsed]);

  // The notch merges into the header once you leave the very top. This is a boolean
  // threshold, not a per-frame effect: React bails out when the value is unchanged, so
  // it re-renders only on the two crossings. Listener is passive and cleaned up.
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Merge only when the header body is fully hidden — with search or filters still
  // showing there is content right above the edge for it to collide with.
  const merged = !atTop && collapsed;

  const showFilters = !collapsed && filtersOpen;
  // Collapsed, the search box and filter chips are out of sight — flag the arrow so a
  // filtered list never looks unexplained.
  const hiddenActive = collapsed && (query.trim() !== "" || filtersActive);

  const ref = useRef<HTMLElement>(null);
  useGlassLight(ref);

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-white/6 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex flex-wrap items-center gap-2 px-5 pt-3 pb-4">
        <Brand className="h-13 shrink-0" />

        {/* watched — fills the rest of the row */}
        <div className="glass flex h-13 min-w-0 flex-1 items-center justify-center rounded-card px-3">
          <Watched {...p} />
        </div>

        {/* search + filters toggle, hidden by the notch */}
        <div
          className={`grid w-full transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            collapsed ? "pointer-events-none grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <SearchBar {...p} activeFilters={p.mediums.size + p.tiers.size} className="h-13 w-full" />
          </div>
        </div>
      </div>

      {/* collapsible filters panel — order, then tier/medium cards */}
      <div
        className={`mx-auto grid max-w-350 px-5 transition-[grid-template-rows,opacity] duration-300 ease-out ${
          showFilters ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {/* order (sort) — hides together with the filters */}
          <div className="glass mb-2.5 flex items-center justify-center gap-2 rounded-card px-3 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-fg-3">Order</span>
            <OrderToggle {...p} />
          </div>
          <div className="flex flex-row justify-between gap-3 pb-3">
            <div className="glass flex flex-col gap-2 rounded-card px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-fg-3">Tier</span>
              <div className="flex flex-wrap items-center gap-1">
                <TierChips {...p} />
              </div>
            </div>

            <div className="glass flex flex-col gap-2 rounded-card px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-fg-3">Medium</span>
              <div className="flex flex-wrap items-center gap-1">
                <MediumChips {...p} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* squircle notch — below search AND filters, off the header's bottom edge.
          Normally it hangs out and rounds downward; scrolled AND collapsed it slides up
          by its own height (translate, so no layout cost) and flips to round upward,
          merging flush into the header. The caret is deliberately NOT part of that flip —
          it keeps answering to `collapsed` alone. Stays clickable in both states. The
          sticky header is already a positioned ancestor, so no z-index. */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand search and filters" : "Collapse search and filters"}
        className={`absolute left-1/2 top-full flex h-5 w-16 -translate-x-1/2 items-center justify-center border border-white/10 bg-zinc-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-[translate,border-radius] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] ${
          merged
            ? "-translate-y-full rounded-t-2xl border-b-0"
            : "-translate-y-px rounded-b-2xl border-t-0"
        }`}
      >
        <CaretDownIcon
          size={14}
          className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            collapsed ? "" : "rotate-180"
          } ${hiddenActive ? "text-white" : "text-zinc-500"}`}
        />
      </button>
    </header>
  );
};
