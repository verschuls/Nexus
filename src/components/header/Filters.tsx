// Order toggle and the tier / medium filter chips.
import type { ReactNode } from "react";
import { FilmStripIcon, PlayCircleIcon, TelevisionSimpleIcon, type Icon } from "@phosphor-icons/react";
import { CATEGORIES, categoryLabel, itemsByCategory, items as ALL_ITEMS } from "../../lib/catalog";
import { TIERS } from "../../lib/meta";
import type { Category, SortMode } from "../../lib/types";
import { Button } from "../ui";
import type { HeaderProps } from "./types";

const MEDIUM_ICON: Record<Category, Icon> = {
  movies: FilmStripIcon,
  series: TelevisionSimpleIcon,
  shorts: PlayCircleIcon,
};

const SORTS: { key: SortMode; label: string }[] = [
  { key: "chrono", label: "Chronological" },
  { key: "release", label: "Release" },
];

// Static per-medium / per-tier counts — `items` never changes, so tally once.
const COUNT: Record<Category, number> = {
  movies: itemsByCategory("movies").length,
  series: itemsByCategory("series").length,
  shorts: itemsByCategory("shorts").length,
};
const TIER_COUNT: Record<string, number> = {};
for (const it of ALL_ITEMS) {
  TIER_COUNT[it.data.tier] = (TIER_COUNT[it.data.tier] ?? 0) + 1;
}

export function OrderToggle({ sort, setSort }: Pick<HeaderProps, "sort" | "setSort">) {
  return (
    <div role="group" aria-label="Order" className="edge inline-flex divide-x divide-white/10 overflow-hidden rounded-control bg-(--control-fill)">
      {SORTS.map((s) => (
        <button
          key={s.key}
          type="button"
          aria-pressed={sort === s.key}
          onClick={() => setSort(s.key)}
          className="h-8 cursor-pointer px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-white/8 hover:text-fg-1 aria-pressed:bg-white/12 aria-pressed:text-fg-1"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* Multi-select chip: pressed = glass control, idle = ghost. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button variant={on ? "glass" : "ghost"} size="sm" aria-pressed={on} onClick={onClick}>
      {children}
    </Button>
  );
}
const count = (on: boolean) => `font-mono text-xs ${on ? "text-fg-2" : "text-fg-3"}`;

export function TierChips({
  tiers,
  allTiers,
  clearTiers,
  toggleTier,
  total,
}: Pick<HeaderProps, "tiers" | "allTiers" | "clearTiers" | "toggleTier" | "total">) {
  return (
    <>
      <Chip on={allTiers} onClick={clearTiers}>
        All <span className={count(allTiers)}>{total}</span>
      </Chip>
      {TIERS.map((t) => {
        const on = tiers.has(t.key);
        return (
          <Chip key={t.key} on={on} onClick={() => toggleTier(t.key)}>
            <span className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.label}
            <span className={count(on)}>{TIER_COUNT[t.key] ?? 0}</span>
          </Chip>
        );
      })}
    </>
  );
}

export function MediumChips({
  mediums,
  allMediums,
  clearMediums,
  toggleMedium,
  total,
}: Pick<HeaderProps, "mediums" | "allMediums" | "clearMediums" | "toggleMedium" | "total">) {
  return (
    <>
      <Chip on={allMediums} onClick={clearMediums}>
        All <span className={count(allMediums)}>{total}</span>
      </Chip>
      {CATEGORIES.map((c) => {
        const Glyph = MEDIUM_ICON[c];
        const on = mediums.has(c);
        return (
          <Chip key={c} on={on} onClick={() => toggleMedium(c)}>
            <Glyph size={16} />
            {categoryLabel(c)}
            <span className={count(on)}>{COUNT[c]}</span>
          </Chip>
        );
      })}
    </>
  );
}
