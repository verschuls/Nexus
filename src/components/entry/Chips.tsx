import { GlobeHemisphereWestIcon, type Icon } from "@phosphor-icons/react";
import { EARTH_COLOR, tagMeta, tierMeta } from "../../lib/meta";

/* Hex chip — pill badge tinted from one hex (alpha bytes give the ~12%
   background and ~24% border). Used for tiers, tags and Earth. */
export function HexChip({ color, icon: Glyph, label }: { color: string; icon?: Icon; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium [&_svg]:size-3"
      style={{ color, backgroundColor: `${color}1f`, borderColor: `${color}3d` }}
    >
      {Glyph && <Glyph weight="bold" />}
      {label}
    </span>
  );
}

export function Chips({ tier, tags, earth }: { tier?: string; tags: string[]; earth?: string }) {
  return (
    <>
      {tier && <HexChip color={tierMeta(tier).color} label={tierMeta(tier).label} />}
      {tags.map((t) => (
        <HexChip key={t} {...tagMeta(t)} />
      ))}
      {earth && <HexChip color={EARTH_COLOR} icon={GlobeHemisphereWestIcon} label={`Earth-${earth}`} />}
    </>
  );
}
