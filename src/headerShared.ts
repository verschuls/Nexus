// Shared bits for the desktop (Header) and mobile (HeaderMobile) headers.
// Only pure data / style helpers / the prop contract live here — each header
// keeps its own layout JSX.
import type { FC, RefObject } from "react";
import { itemsByCategory, items as ALL_ITEMS } from "./data";
import type { Category, SortMode } from "./data";
import { IconClip, IconFilm, IconShort, IconTv, type IconProps } from "./icons";

export const MEDIUM_ICON: Record<Category, FC<IconProps>> = {
  movies: IconFilm,
  series: IconTv,
  oneshots: IconClip,
  shorts: IconShort,
};

export const SORTS: { key: SortMode; label: string }[] = [
  { key: "chrono", label: "In-universe" },
  { key: "semi", label: "Semi-chrono" },
  { key: "release", label: "Release" },
];

// Static per-medium / per-tier counts — `items` never changes, so tally once.
export const COUNT: Record<Category, number> = {
  movies: itemsByCategory("movies").length,
  series: itemsByCategory("series").length,
  oneshots: itemsByCategory("oneshots").length,
  shorts: itemsByCategory("shorts").length,
};
export const TIER_COUNT: Record<string, number> = {};
for (const it of ALL_ITEMS) {
  TIER_COUNT[it.data.tier] = (TIER_COUNT[it.data.tier] ?? 0) + 1;
}

/* Segmented control button — active = soft white chip. */
export const seg = (on: boolean) =>
  `rounded-xl px-3 py-1.5 text-sm font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.96] ${
    on
      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "text-zinc-500 hover:text-zinc-200"
  }`;

/* Filter button — same active look as `seg`; sits inside a unified container. */
export const filterBtn = (on: boolean) =>
  `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.96] ${
    on
      ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      : "text-zinc-400 hover:text-zinc-200"
  }`;
export const filterCount = (on: boolean) => `font-mono text-xs ${on ? "text-zinc-400" : "text-zinc-500"}`;

export interface HeaderProps {
  query: string;
  setQuery: (v: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  mediums: Set<Category>;
  tiers: Set<string>;
  allMediums: boolean;
  allTiers: boolean;
  clearMediums: () => void;
  toggleMedium: (c: Category) => void;
  clearTiers: () => void;
  toggleTier: (t: string) => void;
  sort: SortMode;
  setSort: (s: SortMode) => void;
  total: number;
  watchedNum: number;
  totalNum: number;
  watchPct: number;
}
