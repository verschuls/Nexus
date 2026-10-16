import type { HeaderProps } from "./types";

/* Conic progress ring + count. */
export function Watched({ watchedNum, totalNum, watchPct }: Pick<HeaderProps, "watchedNum" | "totalNum" | "watchPct">) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(#34d399 ${watchPct * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-8.5 w-8.5 place-items-center rounded-full bg-zinc-950 font-mono text-[9px] text-fg-2">
          {watchPct}%
        </div>
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-wider text-fg-3">Watched</p>
        <p className="font-mono text-sm text-fg-1">
          {watchedNum}
          <span className="text-fg-3">/{totalNum}</span>
        </p>
      </div>
    </div>
  );
}
