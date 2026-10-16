import { episodeTags, seasonTags, seasonTier, totalEpisodes } from "../../lib/catalog";
import { SINGULAR, byTagOrder } from "../../lib/meta";
import type { Item } from "../../lib/types";

/* ------------------------------------------------------------------ *
 * What a card shows. A chronological series run (one season) gets that
 * season's dates, tier and tags, not the show's.
 * ------------------------------------------------------------------ */
export interface InfoTarget {
  item: Item;
  runSeason?: string;
}

export function describe({ item, runSeason }: InfoTarget) {
  const d = item.data;
  const isSeries = item.category === "series";
  const runtime = isSeries
    ? d.runtimePerEp ? `${d.runtimePerEp} min / ep` : "-"
    : d.runtimeMinutes ? `${d.runtimeMinutes} min` : "-";

  const season = runSeason ? d.seasons?.[runSeason] : undefined;
  if (runSeason && season?.episodes.length) {
    const eps = season.episodes;
    return {
      subtitle: `Season ${runSeason}`,
      tier: seasonTier(d, runSeason),
      // The season's tags plus whatever its episodes add or override.
      tags: [...new Set([...seasonTags(d, season), ...eps.flatMap((e) => episodeTags(d, season, e))])].sort(byTagOrder),
      released: eps[0].releaseDate,
      inUniverse: season.inUniverseTime ?? d.inUniverseTime,
      runtime,
      seasons: { [runSeason]: season },
      isRun: true,
    };
  }

  const n = Object.keys(d.seasons ?? {}).length;
  return {
    subtitle: isSeries
      ? `${n} season${n === 1 ? "" : "s"} · ${totalEpisodes(d)} episodes`
      : SINGULAR[item.category],
    tier: d.tier,
    tags: [...(d.tags ?? [])].sort(byTagOrder),
    released: d.releaseDate,
    inUniverse: d.inUniverseTime,
    runtime,
    seasons: isSeries ? d.seasons : undefined,
    isRun: false,
  };
}
