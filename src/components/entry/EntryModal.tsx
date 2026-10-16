import { categoryLabel } from "../../lib/catalog";
import { Modal } from "../ui";
import { Chips } from "./Chips";
import { describe, type InfoTarget } from "./describe";
import { Meta } from "./Meta";
import { EpisodeList, Seasons } from "./Seasons";

/* ------------------------------------------------------------------ *
 * Details modal — one instance, owned by App. Everything the card clamps
 * or leaves out (full description, notes, episodes) lives here.
 * ------------------------------------------------------------------ */
export function EntryModal({ target, onClose }: { target: InfoTarget | null; onClose: () => void }) {
  const v = target && describe(target);
  return (
    <Modal open={!!target} onClose={onClose} title={target?.item.data.title ?? ""} description={v?.subtitle}>
      {target && v && (
        <div className="grid gap-5">
          <div className="flex flex-wrap gap-1.5">
            <Chips tier={v.tier} tags={v.tags} earth={target.item.data.earth} />
          </div>

          <p className="text-sm leading-relaxed text-zinc-300">{target.item.data.description}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Meta wrap label="Released" value={v.released} />
            <Meta wrap label="Runtime" value={v.runtime} />
            <Meta wrap label="In-universe" value={v.inUniverse} className="col-span-2" />
          </div>

          {target.item.data.notes ? (
            <p className="border-l-2 border-white/10 pl-3 text-xs italic leading-relaxed text-zinc-400">
              {target.item.data.notes}
            </p>
          ) : null}

          {v.seasons &&
            (v.isRun ? (
              <div className="border-t border-white/6">
                <EpisodeList entry={target.item.data} season={Object.values(v.seasons)[0]} />
              </div>
            ) : (
              <Seasons entry={target.item.data} seasons={v.seasons} />
            ))}

          <p className="font-mono text-[11px] text-zinc-600">
            {categoryLabel(target.item.category)} · {target.item.id}
            {target.runSeason ? `:${target.runSeason}` : ""}
          </p>
        </div>
      )}
    </Modal>
  );
}
