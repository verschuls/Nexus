// Loads every entry under src/data/** at build time via Vite's glob import,
// so the catalog stays in sync with the JSON files with zero manual manifest.
import type { Category, Entry, Episode, Item, Season } from "./types";

const modules = import.meta.glob("../data/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Entry>;

const CATEGORY_LABEL: Record<Category, string> = {
  movies: "Movies",
  series: "Series",
  shorts: "Shorts",
};

export const CATEGORIES: Category[] = ["movies", "series", "shorts"];

export function categoryLabel(c: Category): string {
  return CATEGORY_LABEL[c] ?? c;
}

/** dd.mm.yyyy -> sortable epoch ms. Falls back to 0 on malformed input. */
function parseReleaseDate(d: string): number {
  const [dd, mm, yy] = (d ?? "").split(".").map((n) => parseInt(n, 10));
  if (!yy) return 0;
  return new Date(yy, (mm || 1) - 1, dd || 1).getTime();
}

export const items: Item[] = Object.entries(modules)
  .map(([path, data]) => {
    const m = path.match(/data\/([^/]+)\/([^/]+)\.json$/);
    return m
      ? { id: m[2], category: m[1] as Category, data }
      : null;
  })
  .filter((x): x is Item => x !== null)
  .sort(
    (a, b) => parseReleaseDate(a.data.releaseDate) - parseReleaseDate(b.data.releaseDate),
  );

export function itemsByCategory(c: Category): Item[] {
  return items.filter((it) => it.category === c);
}

/** A season's own tier when the show overrides it, else the show tier. */
export function seasonTier(entry: Entry, season?: string): string {
  return (season && entry.seasons?.[season]?.tier) || entry.tier;
}

/** Tag cascade: show -> season -> episode, unless `inherit: false` cuts it. */
export function seasonTags(entry: Entry, s: Season): string[] {
  return s.tags ?? (entry.inherit === false || s.inherit === false ? [] : entry.tags ?? []);
}
export function episodeTags(entry: Entry, s: Season, ep: Episode): string[] {
  return ep.tags ?? (entry.inherit === false || ep.inherit === false ? [] : seasonTags(entry, s));
}

export function totalEpisodes(entry: Entry): number {
  if (!entry.seasons) return 0;
  return Object.values(entry.seasons).reduce((sum, s) => sum + s.episodes.length, 0);
}
