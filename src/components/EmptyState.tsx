import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-24 text-center">
      <MagnifyingGlassIcon size={32} className="text-zinc-700" />
      <p className="text-sm text-zinc-400">
        {query ? <>No entries match “{query}”.</> : "No entries for the selected filters."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:text-white active:scale-[0.98]"
      >
        Reset filters
      </button>
    </div>
  );
}
