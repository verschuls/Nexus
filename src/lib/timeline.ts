import chronoRaw from "../data/chrono.json";
import { items } from "./catalog";
import type { Episode, Item } from "./types";

// ---------------------------------------------------------------------------
// Watch-order timeline: one row per entry, IN FILE ORDER — the position of an
// entry in chrono.json is its watch order, so entries carry
// no `order` field. Insert a row where it belongs and you're done; numbering is
// derived here and can never drift, gap, or collide.
//   - `id: "slug"`          → flat film / short / one-shot (whole item)
//   - `id: "slug:season"`   → that whole season
// ---------------------------------------------------------------------------
export interface TimelineUnit {
  order: number; // 1-based position after orphans are dropped (display only)
  item: Item;
  season?: string; // set for a series run
  eps?: Episode[]; // the season's episodes, for a series run
}

const bySlug: Record<string, Item> = {};
items.forEach((it) => {
  bySlug[it.id] = it;
});

type TimelineRow = { id: string };

function buildTimeline(raw: TimelineRow[]): TimelineUnit[] {
  return raw
    .map((e): Omit<TimelineUnit, "order"> | null => {
      const [slug, season] = e.id.split(":");
      const item = bySlug[slug];
      if (!item) return null; // orphan id — skip rather than crash
      const run = season ? item.data.seasons?.[season] : undefined;
      if (run) return { item, season, eps: run.episodes };
      return { item }; // flat film/short/one-shot or whole-series ref
    })
    .filter((u): u is Omit<TimelineUnit, "order"> => u !== null)
    // Number after orphan removal so the visible sequence is always 1..N.
    .map((u, i) => ({ ...u, order: i + 1 }));
}

export const timeline = buildTimeline(chronoRaw as TimelineRow[]);

/** Stable per-unit key for watched persistence — derived from content
 * (slug:season:episodes), NOT the positional `order`, so inserting or moving
 * timeline rows never invalidates saved progress. */
export function unitKey(u: TimelineUnit): string {
  return `${u.item.id}:${u.season ?? ""}:${u.eps?.map((e) => e.id).join(".") ?? ""}`;
}
