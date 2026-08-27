import { SectionLabel } from "@/components/common/EmptyState";
import { formatPct } from "@/lib/formatters";
import type { HistoricalAnalogue } from "@/types/multibagger";

export function HistoricalAnalogues({ analogues }: { analogues: HistoricalAnalogue[] }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Historical Analogues</SectionLabel>
      <div className="space-y-2">
        {analogues.map((a, i) => (
          <div key={i} className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{a.company}</p>
              <div className="flex items-center gap-3">
                <span className="font-mono-tabular text-[11px] text-[var(--color-text-tertiary)]">{a.similarityPct}% similar</span>
                <span className="font-mono-tabular text-[13px] font-semibold text-[var(--color-accent)]">{formatPct(a.maxReturnPct, { signed: true })}</span>
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{a.whatHappened}</p>
            <p className="mt-1 font-mono-tabular text-[10.5px] text-[var(--color-text-disabled)]">{a.period}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
