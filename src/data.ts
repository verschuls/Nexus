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
// series runs, and a series recurs across many orders — so rank each show by the
// FIRST (lowest) order any of its entries appears at. Keyed by the base slug
// (before ":") so a series file id like "aos" resolves against "aos:2" etc.
const chronoIndex: Record<string, number> = {};
(chronoRaw as { order: number; id: string }[]).forEach((e) => {
  const base = e.id.split(":")[0];
  if (chronoIndex[base] === undefined || e.order < chronoIndex[base]) {
    chronoIndex[base] = e.order;
  }
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
// Watch-order timelines: one row per entry.
//   - `id: "slug"`          → flat film / short / one-shot (whole item)
//   - `id: "slug:season"`   → a season run; with `eps` it shows only those
//                             episodes, WITHOUT `eps` it shows the whole season.
// Used by both chrono.json (episode-interleaved) and semi-chrono.json (collapsed).
// ---------------------------------------------------------------------------
export interface TimelineUnit {
  order: number;
  item: Item;
  season?: string; // set for a series run
  eps?: Episode[]; // the episodes shown for this run (whole season if unspecified)
}

const bySlug: Record<string, Item> = {};
items.forEach((it) => {
  bySlug[it.id] = it;
});

function buildTimeline(raw: { order: number; id: string; eps?: number[] }[]): TimelineUnit[] {
  return raw
    .map((e): TimelineUnit | null => {
      const [slug, season] = e.id.split(":");
      const item = bySlug[slug];
      if (!item) return null; // orphan id — skip rather than crash
      if (season && item.data.seasons?.[season]) {
        const all = item.data.seasons[season];
        const picked = e.eps ? new Set(e.eps) : null;
        const eps = picked ? all.filter((ep) => picked.has(ep.id)) : all;
        return { order: e.order, item, season, eps };
      }
      return { order: e.order, item }; // flat film/short/one-shot or whole-series ref
    })
    .filter((u): u is TimelineUnit => u !== null);
}

export const timeline = buildTimeline(chronoRaw as { order: number; id: string; eps?: number[] }[]);
export const timelineSemi = buildTimeline(semiRaw as { order: number; id: string; eps?: number[] }[]);

/** Stable per-unit key for watched persistence — derived from content
 * (slug:season:episodes), NOT the volatile `order`, so renumbering the
 * timelines never invalidates saved progress. */
export function unitKey(u: TimelineUnit): string {
  return `${u.item.id}:${u.season ?? ""}:${u.eps?.map((e) => e.id).join(".") ?? ""}`;
}
