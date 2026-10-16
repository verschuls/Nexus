/* One-time notice after the watched-key migration cleared chronological progress. */
export function ResetNotice({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-zinc-50">Watch progress reset</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          The watch-order data changed, so your chronological progress was cleared.
          Release-order progress is untouched — and thanks to a saving change, this
          won’t happen again.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
