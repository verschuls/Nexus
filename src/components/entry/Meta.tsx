export function Meta({ label, value, className = "", wrap }: { label: string; value: string; className?: string; wrap?: boolean }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-sm text-zinc-300 ${wrap ? "" : "truncate"}`} title={value}>{value}</div>
    </div>
  );
}
