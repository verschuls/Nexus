import { memo } from "react";
import { CheckIcon, InfoIcon } from "@phosphor-icons/react";
import { tierMeta } from "../../lib/meta";
import type { Item } from "../../lib/types";
import { Button } from "../ui";
import { Chips, HexChip } from "./Chips";
import { describe, type InfoTarget } from "./describe";
import { Meta } from "./Meta";

/* ------------------------------------------------------------------ *
 * Entry card — memoized, fixed shape: every block is clamped or reserved so
 * all cards come out the same height. In the Timeline a series appears once
 * per season run; `runSeason` makes the card about that season.
 * ------------------------------------------------------------------ */
export interface EntryCardProps {
  item: Item;
  index: number;
  watched: boolean;
  // Watched is keyed by show id (release view) or unit key (chronological view).
  toggleKey: string;
  onToggle: (key: string) => void;
  onInfo: (target: InfoTarget) => void;
  runSeason?: string;
}

function EntryCardImpl({ item, index, watched, toggleKey, onToggle, onInfo, runSeason }: EntryCardProps) {
  const { data } = item;
  const v = describe({ item, runSeason });

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
        <div className="flex h-6 items-center justify-between gap-3">
          <span className="font-mono text-xs text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
          <div className="flex items-center gap-2">
            <HexChip color={tierMeta(v.tier).color} label={tierMeta(v.tier).label} />
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                watched ? "border-emerald-400 bg-emerald-400 text-zinc-950" : "border-zinc-600 text-transparent"
              }`}
            >
              <CheckIcon size={12} weight="bold" />
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold leading-tight tracking-tight text-zinc-50" title={data.title}>
            {data.title}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{v.subtitle}</p>
        </div>

        <p className="line-clamp-3 min-h-[3lh] text-sm leading-relaxed text-zinc-400">{data.description}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Meta label="Released" value={v.released} />
          <Meta label="Runtime" value={v.runtime} />
          <Meta label="In-universe" value={v.inUniverse} className="col-span-2" />
        </div>

        {/* One reserved line; anything past the edge fades out (all of it is in the modal). */}
        <div className="flex h-6 items-center gap-1.5 overflow-hidden mask-[linear-gradient(to_right,#000_85%,transparent)]">
          <Chips tags={v.tags} earth={data.earth} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/6 py-1.5 pl-5 pr-2">
        <span className="font-mono text-[11px] text-zinc-600">
          {item.id}
          {runSeason ? `:${runSeason}` : ""}
        </span>
        <Button
          aria-label="Details"
          data-tip="Details"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onInfo({ item, runSeason });
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <InfoIcon size={16} />
        </Button>
      </div>
    </div>
  );
}

export const EntryCard = memo(EntryCardImpl);
