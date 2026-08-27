export function ScoreBar({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">{label}</span>
        <span className="font-mono-tabular text-[12px] font-semibold text-[var(--color-text-primary)]">{value}<span className="text-[var(--color-text-disabled)]">/100</span></span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${value}%`,
            background: invert
              ? value > 60 ? "var(--color-text-tertiary)" : "var(--color-accent)"
              : value > 60 ? "var(--color-accent)" : "var(--color-text-tertiary)",
          }}
        />
      </div>
    </div>
  );
}
