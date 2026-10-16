// Tier and tag colours, labels and icons, shared by cards, the details modal
// and the header filters.
import {
  AtomIcon,
  ClockCounterClockwiseIcon,
  GitBranchIcon,
  LightbulbIcon,
  ProhibitIcon,
  QuestionIcon,
  WarningIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { Category } from "./types";

// Tier badge colors — plain hex, edit freely (#rrggbb). One value drives the
// whole chip: text + soft background + border tint are derived from it.
const TIER: Record<string, { label: string; color: string }> = {
  essential:     { label: "Essential",     color: "#35e935" },
  recommended:   { label: "Worthwhile",   color: "#25b37c" },
  optional:      { label: "Optional",      color: "#e0d039" },
  completionist: { label: "100%", color: "#eb3150" },
  legacy:        { label: "Legacy",        color: "#9e964a" },
};
export function tierMeta(tier: string) {
  return TIER[tier] ?? { label: tier, color: "#8b8b93" };
}

// Ordered tier list for the filter UI (shares the same colors as the badges).
export const TIERS = (
  ["essential", "recommended", "optional", "completionist", "legacy"] as const
).map((key) => ({ key: key as string, label: TIER[key].label, color: TIER[key].color }));

// The keys you write in a JSON `tags` array. Same hex scheme as tiers; the
// order here is the order chips render in. Unknown keys still show, in grey.
export const TAGS: Record<string, { label: string; color: string; icon: Icon }> = {
  alt:         { label: "Alt universe", color: "#8b5cf6", icon: GitBranchIcon },
  unconfirmed: { label: "Unconfirmed",  color: "#ffb429", icon: QuestionIcon },
  inspired:    { label: "Inspired",     color: "#e0d039", icon: LightbulbIcon },
  dubious:     { label: "Dubious",      color: "#ff9900", icon: WarningIcon },
  noncanon:    { label: "Non-canon",    color: "#8b8b93", icon: ProhibitIcon },
  timetravel:  { label: "Time travel",  color: "#3beba1", icon: ClockCounterClockwiseIcon },
  multiverse:  { label: "Multiverse",   color: "#6366f1", icon: AtomIcon },
};
const TAG_ORDER = Object.keys(TAGS);
export const EARTH_COLOR = "#38bdf8";

export function tagMeta(tag: string) {
  return TAGS[tag] ?? { label: tag, color: "#8b8b93", icon: QuestionIcon };
}
export const byTagOrder = (a: string, b: string) =>
  (TAG_ORDER.indexOf(a) + 1 || 99) - (TAG_ORDER.indexOf(b) + 1 || 99);

export const SINGULAR: Record<Category, string> = {
  movies: "Movie",
  series: "Series",
  shorts: "Short",
};
