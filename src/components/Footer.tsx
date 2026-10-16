import { CoffeeIcon } from "@phosphor-icons/react";
import type { SortMode } from "../lib/types";

export function Footer({ count, sort }: { count: number; sort: SortMode }) {
  return (
    <footer className="mx-auto max-w-350 px-5 pb-12 pt-4">
      <p className="text-center font-mono text-[11px] text-zinc-700">
        {count} {count === 1 ? "entry" : "entries"} ·{" "}
        {sort === "chrono" ? "chronological order" : "release order"}
      </p>

      <div className="mx-auto my-6 h-px w-16 bg-linear-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex flex-col items-center gap-2.5">
        <p className="flex items-center gap-1.5 text-sm text-zinc-400">
          Made by
          <a
            href="https://verschuls.xyz"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-zinc-100 transition-[color,text-shadow] duration-200 hover:text-white hover:[text-shadow:0_0_12px_rgba(255,255,255,0.5)]"
          >
            Verschuls
          </a>
          with
          <CoffeeIcon size={16} className="text-amber-500/90" />
        </p>

        <p className="text-xs text-zinc-500">
          Data &amp; timeline courtesy of{" "}
          <a
            href="https://marvelcinematicuniverse.fandom.com"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400/80 underline-offset-2 transition-colors hover:text-sky-300 hover:underline"
          >
            the MCU Fandom Wiki
          </a>
        </p>

        <p className="max-w-md text-center text-[11px] leading-relaxed text-zinc-600">
          Not affiliated with, endorsed by, or associated with Marvel, the MCU, or Fandom.
          All trademarks and content belong to their respective owners.
        </p>
      </div>
    </footer>
  );
}
