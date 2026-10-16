import type { RefObject } from "react";
import type { Category, SortMode } from "../../lib/types";

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
