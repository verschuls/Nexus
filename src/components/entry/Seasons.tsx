import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { episodeTags } from "../../lib/catalog";
import { byTagOrder, tagMeta, tierMeta } from "../../lib/meta";
import type { Entry, Season } from "../../lib/types";
import { HexChip } from "./Chips";

export function EpisodeList({ entry, season }: { entry: Entry; season: Season }) {
  return (
    <ol className="divide-y divide-white/5">
      {season.episodes.map((ep) => (
        <li key={ep.id} className="flex items-center gap-3 py-2">
          <span className="w-6 shrink-0 text-right font-mono text-xs text-zinc-500">{ep.id}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{ep.title}</span>
          {[...episodeTags(entry, season, ep)].sort(byTagOrder).map((t) => {
            const { icon: Glyph, color, label } = tagMeta(t);
            return <Glyph key={t} size={14} weight="bold" color={color} className="shrink-0" aria-label={label} />;
          })}
          <span className="shrink-0 font-mono text-xs text-zinc-500">{ep.releaseDate}</span>
        </li>
      ))}
    </ol>
  );
}

/* Season list for a whole series — controlled disclosure with a smooth
   grid-rows height animation (0fr -> 1fr), matching the header filter panel. */
export function Seasons({ entry, seasons }: { entry: Entry; seasons: Record<string, Season> }) {
  const keys = Object.keys(seasons).sort((a, b) => Number(a) - Number(b));
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (num: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  return (
    <div className="border-t border-white/6">
      {keys.map((num) => {
        const { episodes: eps, tier, inUniverseTime } = seasons[num];
        const isOpen = open.has(num);
        return (
          <div key={num} className="border-b border-white/6">
            <button
              type="button"
              onClick={() => toggle(num)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center gap-3 py-3 text-sm text-zinc-200 hover:text-white"
            >
              <span className="font-medium">Season {num}</span>
              <span className="font-mono text-xs text-zinc-500">{eps.length} ep{eps.length === 1 ? "" : "s"}</span>
              {inUniverseTime && <span className="min-w-0 truncate text-xs text-zinc-500">{inUniverseTime}</span>}
              {tier && <HexChip color={tierMeta(tier).color} label={tierMeta(tier).label} />}
              <CaretDownIcon
                size={16}
                className={`ml-auto text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mb-2 border-t border-white/5">
                  <EpisodeList entry={entry} season={seasons[num]} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
