import { memo, useState } from "react";
import { categoryLabel, totalEpisodes } from "./data";
import type { Entry, Episode, Item } from "./data";
import {
  IconBranch,
  IconCal,
  IconCheck,
  IconChevron,
  IconClock,
  IconFilm,
  IconLoop,
  IconTv,
} from "./icons";

/* ------------------------------------------------------------------ *
 * Tier / state visual mapping
 * ------------------------------------------------------------------ */
// Tier badge colors — plain hex, edit freely (#rrggbb). One value drives the
// whole chip: text + soft background + border tint are derived from it.
const TIER: Record<string, { label: string; color: string }> = {
  essential:     { label: "Essential",     color: "#35e935" },
  recommended:   { label: "Worthwhile",   color: "#25b37c" },
  optional:      { label: "Optional",      color: "#e0d039" },
  completionist: { label: "100%", color: "#eb3150" },
  legacy:        { label: "Legacy",        color: "#9e964a" },
};
function tierMeta(tier: string) {
  return TIER[tier] ?? { label: tier, color: "#8b8b93" };
}

// Ordered tier list for the filter UI (shares the same colors as the badges).
export const TIERS = (
  ["essential", "recommended", "optional", "completionist", "legacy"] as const
).map((key) => ({ key: key as string, label: TIER[key].label, color: TIER[key].color }));

// Canon-state badge colors — same hex scheme, edit freely. Keyed by the `state`
// field. "Reality" is the default and never renders a badge. TIMETRAVEL_COLOR
// is the separate time-travel flag.
const STATE: Record<string, string> = {
  "Alternate Universe": "#8b5cf6",
  "Unconfirmed Canon":  "#ffb429",
  "Inspired Canon":     "#e0d039",
  "Dubious Canon":      "#ff9900",
  "Non-Canon":          "#8b8b93",
  "Reality":            "#8b8b93",
};
const TIMETRAVEL_COLOR = "#3beba1";
function stateColor(state: string) {
  return STATE[state] ?? "#8b8b93";
}

/* Hex badge — soft-chip look, styled entirely from one hex (append alpha bytes
   for the background ~12% and border ~24%). Used for tiers and canon states. */
function HexChip({ color, icon, label }: { color: string; icon?: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5"
      style={{ color, backgroundColor: `${color}1f`, borderColor: `${color}3d` }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */
function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-px text-zinc-600">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{label}</div>
        <div className="truncate text-sm text-zinc-300">{value}</div>
      </div>
    </div>
  );
}

function Flags({ entry }: { entry: Entry }) {
  const alt = entry.state && entry.state !== "Reality";
  if (!entry.timetravel && !alt) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {entry.timetravel && (
        <HexChip color={TIMETRAVEL_COLOR} icon={<IconLoop className="h-3 w-3" />} label="Time travel" />
      )}
      {alt && (
        <HexChip color={stateColor(entry.state)} icon={<IconBranch className="h-3 w-3" />} label={entry.state} />
      )}
    </div>
  );
}

/* Season / episode list — controlled disclosure with a smooth grid-rows
   height animation (0fr -> 1fr), matching the header filter panel. */
function Seasons({
  seasons,
  perSeasonTier,
}: {
  seasons: Record<string, Episode[]>;
  perSeasonTier?: Record<string, string>;
}) {
  const keys = Object.keys(seasons).sort((a, b) => Number(a) - Number(b));
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (num: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  return (
    <div
      className="border-t border-white/6"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {keys.map((num) => {
        const eps = seasons[num];
        const seasonTier = perSeasonTier?.[num];
        const isOpen = open.has(num);
        return (
          <div key={num} className="border-b border-white/6">
            <button
              type="button"
              onClick={() => toggle(num)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center gap-3 py-3 text-sm text-zinc-200 outline-none hover:text-white"
            >
              <span className="font-medium">Season {num}</span>
              <span className="font-mono text-xs text-zinc-500">{eps.length} ep{eps.length === 1 ? "" : "s"}</span>
              {seasonTier ? (
                <HexChip color={tierMeta(seasonTier).color} label={tierMeta(seasonTier).label} />
              ) : null}
              <IconChevron
                className={`ml-auto h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <ol className="mb-2 divide-y divide-white/5 border-t border-white/5">
                  {eps.map((ep) => {
                    const alt = ep.state && ep.state !== "Reality";
                    return (
                      <li key={ep.id} className="flex items-center gap-3 py-2">
                        <span className="w-6 shrink-0 text-right font-mono text-xs text-zinc-600">{ep.id}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{ep.title}</span>
                        {ep.timetravel && <IconLoop className="h-3.5 w-3.5 shrink-0 text-rose-400/80" />}
                        {alt && <IconBranch className="h-3.5 w-3.5 shrink-0 text-sky-400/80" />}
                        <span className="shrink-0 font-mono text-xs text-zinc-600">{ep.releaseDate}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Entry card — memoized. In the Timeline a series appears once per chrono
 * run; `runSeason` + `runEps` restrict the accordion to just that run's
 * season and its cherry-picked episodes.
 * ------------------------------------------------------------------ */
export interface EntryCardProps {
  item: Item;
  index: number;
  watched: boolean;
  // Watched is keyed by show id (release view) or chrono order (in-universe view).
  toggleKey: string | number;
  onToggle: (key: string | number) => void;
  runSeason?: string;
  runEps?: Episode[];
}

function EntryCardImpl({ item, index, watched, toggleKey, onToggle, runSeason, runEps }: EntryCardProps) {
  const { data, category } = item;
  const tier = tierMeta(data.tier);
  const isSeries = category === "series";
  const runtime = isSeries
    ? data.runtimePerEp
      ? `${data.runtimePerEp} min / ep`
      : "—"
    : data.runtimeMinutes
      ? `${data.runtimeMinutes} min`
      : "—";
  const seasonCount = Object.keys(data.seasons ?? {}).length;
  const scope = isSeries ? `${seasonCount} season${seasonCount === 1 ? "" : "s"} · ${totalEpisodes(data)} eps` : runtime;
  const seasonsToShow =
    runSeason && runEps ? { [runSeason]: runEps } : data.seasons;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={watched}
      onClick={() => onToggle(toggleKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(toggleKey);
        }
      }}
      className={`cv-card flex h-full cursor-pointer flex-col rounded-2xl border outline-none transition-colors duration-200 focus-visible:border-white/30 ${
        watched
          ? "border-emerald-500/30 bg-emerald-500/4"
          : "border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/[0.035]"
      }`}
    >
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-zinc-600">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            <HexChip color={tier.color} label={tier.label} />
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                watched ? "border-emerald-400 bg-emerald-400 text-zinc-950" : "border-zinc-600 text-transparent"
              }`}
            >
              <IconCheck className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold leading-tight tracking-tight text-zinc-50">
            {data.title}
          </h3>
          <span className="mt-1 inline-block font-mono text-[11px] uppercase tracking-wider text-zinc-600">
            {category} · {item.id}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-zinc-400">{data.description}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Meta icon={<IconCal className="h-4 w-4" />} label="Released" value={data.releaseDate} />
          <Meta icon={<IconClock className="h-4 w-4" />} label="Runtime" value={runtime} />
          <Meta icon={<IconTv className="h-4 w-4" />} label="In-universe" value={data.inUniverseTime} />
          <Meta icon={<IconFilm className="h-4 w-4" />} label={isSeries ? "Scope" : "Type"} value={isSeries ? scope : categoryLabel(category)} />
        </div>

        <Flags entry={data} />

        {data.notes ? (
          <p className="border-l-2 border-white/10 pl-3 text-xs italic leading-relaxed text-zinc-500">
            {data.notes}
          </p>
        ) : null}

        {isSeries && seasonsToShow ? (
          <div className="pt-1">
            <Seasons seasons={seasonsToShow} perSeasonTier={data.perSeasonTier} />
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/6 px-5 py-3">
        <div className="flex w-full items-center justify-between font-mono text-[11px] text-zinc-600">
          <span>{categoryLabel(category)}</span>
          <span>{data.inUniverseTime}</span>
        </div>
      </div>
    </div>
  );
}

export const EntryCard = memo(EntryCardImpl);
