export type Category = "movies" | "series" | "shorts";
export type SortMode = "chrono" | "release";

export interface BaseEntry {
  title: string;
  releaseDate: string; // dd.mm.yyyy
  inUniverseTime: string;
  tier: "essential" | "recommended" | "optional" | "completionist" | "legacy" | string;
  // Short keys, see TAGS in EntryCard.tsx: alt, unconfirmed, inspired, dubious,
  // noncanon, timetravel, multiverse. No canon tag = Reality.
  // Cascades show -> season -> episode: leave `tags` out to inherit the
  // parent's, write [] for explicitly none. `inherit: false` (show, season or
  // episode) stops it: that level uses only its own tags. On a show it turns
  // the cascade off for every season and episode.
  tags: string[];
  inherit?: boolean;
  earth?: string; // "10005" -> Earth-10005; omit for the main MCU
  notes: string;
  description: string;
}

export interface Episode {
  id: number;
  title: string;
  releaseDate: string;
  inUniverseTime: string;
  tags?: string[]; // omitted = the season's tags
  inherit?: boolean;
}

export interface Season {
  tier?: string; // overrides the show tier for this season
  inUniverseTime?: string; // shown on this season's card; episodes keep their own
  tags?: string[]; // omitted = the show's tags
  inherit?: boolean;
  episodes: Episode[];
}

export interface FilmEntry extends BaseEntry {
  runtimeMinutes: number;
}

export interface SeriesEntry extends BaseEntry {
  runtimePerEp: number;
  seasons: Record<string, Season>; // keyed by season number
}

export type Entry = FilmEntry & Partial<SeriesEntry>;

export interface Item {
  id: string; // filename slug, e.g. "gotg"
  category: Category;
  data: Entry;
}
