// Loads every entry under src/data/** at build time via Vite's glob import,
// so the catalog stays in sync with the JSON files with zero manual manifest.

import chronoRaw from "./data/chrono.json";
import semiRaw from "./data/semi-chrono.json";

export type Category = "movies" | "series" | "oneshots" | "shorts";
export type SortMode = "chrono" | "semi" | "release";

export interface BaseEntry {
  title: string;
  releaseDate: string; // dd.mm.yyyy
  inUniverseTime: string;
  tier: "essential" | "recommended" | "optional" | "completionist" | "legacy" | string;
  state: string;
  notes: string;
  description: string;
  timetravel: boolean;
}

export interface Episode {
  id: number;
  title: string;
  releaseDate: string;
  inUniverseTime: string;
  timetravel: boolean;
  state: string;
}

export interface FilmEntry extends BaseEntry {
  runtimeMinutes: number;
}

export interface SeriesEntry extends BaseEntry {
  runtimePerEp: number;
  seasons: Record<string, Episode[]>;
  // Optional per-season tier override, keyed by season number. Only present on
  // cherry-picked series; when absent the show-level `tier` applies.
  perSeasonTier?: Record<string, string>;
}

export type Entry = FilmEntry & Partial<SeriesEntry>;

export interface Item {
  id: string; // filename slug, e.g. "gotg"
  category: Category;
  data: Entry;
}

const modules = import.meta.glob("./data/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Entry>;

const CATEGORY_LABEL: Record<Category, string> = {
  movies: "Movies",
  series: "Series",
  oneshots: "One-Shots",
  shorts: "Shorts",
};

export const CATEGORIES: Category[] = ["movies", "series", "oneshots", "shorts"];

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

// In-universe chronological rank per show, from chrono.json.
// chrono ids are either a flat slug ("gotg") or "slug:season" for interleaved
// series runs, and a series recurs many times — so rank each show by its FIRST
// appearance. The file's array order IS the watch order, so the first hit while
// iterating is already the earliest. Keyed by the base slug (before ":") so a
// series file id like "aos" resolves against "aos:2" etc.
const chronoIndex: Record<string, number> = {};
(chronoRaw as { id: string }[]).forEach((e, i) => {
  const base = e.id.split(":")[0];
  if (chronoIndex[base] === undefined) chronoIndex[base] = i;
});

function chronoRank(id: string): number {
  return chronoIndex[id] ?? Number.MAX_SAFE_INTEGER;
}

// Precomputed orderings. `items` is already release-sorted, so release reuses it.
const itemsChrono: Item[] = [...items].sort(
  (a, b) => chronoRank(a.id) - chronoRank(b.id),
);
export function allItems(sort: SortMode): Item[] {
  return sort === "chrono" ? itemsChrono : items;
}

export function totalEpisodes(entry: Entry): number {
  if (!entry.seasons) return 0;
  return Object.values(entry.seasons).reduce((sum, eps) => sum + eps.length, 0);
}

// ---------------------------------------------------------------------------
// Watch-order timelines: one row per entry, IN FILE ORDER — the position of an
// entry in chrono.json / semi-chrono.json is its watch order, so entries carry
// no `order` field. Insert a row where it belongs and you're done; numbering is
// derived here and can never drift, gap, or collide.
//   - `id: "slug"`          → flat film / short / one-shot (whole item)
//   - `id: "slug:season"`   → a season run; with `eps` it shows only those
//                             episodes, WITHOUT `eps` it shows the whole season.
// ---------------------------------------------------------------------------
export interface TimelineUnit {
  order: number; // 1-based position after orphans are dropped (display only)
  item: Item;
  season?: string; // set for a series run
  eps?: Episode[]; // the episodes shown for this run (whole season if unspecified)
}

const bySlug: Record<string, Item> = {};
items.forEach((it) => {
  bySlug[it.id] = it;
});

type TimelineRow = { id: string; eps?: number[] };

function buildTimeline(raw: TimelineRow[]): TimelineUnit[] {
  return raw
    .map((e): Omit<TimelineUnit, "order"> | null => {
      const [slug, season] = e.id.split(":");
      const item = bySlug[slug];
      if (!item) return null; // orphan id — skip rather than crash
      if (season && item.data.seasons?.[season]) {
        const all = item.data.seasons[season];
        const picked = e.eps ? new Set(e.eps) : null;
        const eps = picked ? all.filter((ep) => picked.has(ep.id)) : all;
        return { item, season, eps };
      }
      return { item }; // flat film/short/one-shot or whole-series ref
    })
    .filter((u): u is Omit<TimelineUnit, "order"> => u !== null)
    // Number after orphan removal so the visible sequence is always 1..N.
    .map((u, i) => ({ ...u, order: i + 1 }));
}

export const timeline = buildTimeline(chronoRaw as TimelineRow[]);
export const timelineSemi = buildTimeline(semiRaw as TimelineRow[]);

/** Stable per-unit key for watched persistence — derived from content
 * (slug:season:episodes), NOT the positional `order`, so inserting or moving
 * timeline rows never invalidates saved progress. */
export function unitKey(u: TimelineUnit): string {
  return `${u.item.id}:${u.season ?? ""}:${u.eps?.map((e) => e.id).join(".") ?? ""}`;
}
