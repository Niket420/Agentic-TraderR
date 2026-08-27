import { formatCrores, formatPrice } from "@/lib/formatters";
import { SectionLabel } from "@/components/common/EmptyState";
import type { ScenarioProjection } from "@/types/multibagger";

export function ScenarioViz({ scenarios }: { scenarios: ScenarioProjection[] }) {
  const maxProb = Math.max(...scenarios.map((s) => s.probabilityPct), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <SectionLabel>Scenario Analysis</SectionLabel>
        <span className="text-[10px] text-[var(--color-text-disabled)]">Probabilities are model estimates, not guarantees</span>
      </div>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <div key={s.multiple} className="flex items-center gap-4">
            <div className="w-20 shrink-0 font-mono-tabular text-[13px] font-bold text-[var(--color-text-primary)]">{s.label}</div>
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(4, (s.probabilityPct / maxProb) * 100)}%`, opacity: s.multiple === 1 ? 0.35 : 1 }}
                />
              </div>
            </div>
            <div className="w-16 shrink-0 text-right font-mono-tabular text-[12.5px] font-semibold text-[var(--color-text-primary)]">{s.probabilityPct}%</div>
            <div className="w-24 shrink-0 text-right font-mono-tabular text-[11px] text-[var(--color-text-tertiary)]">{formatPrice(s.impliedPrice)}</div>
            <div className="w-28 shrink-0 text-right font-mono-tabular text-[11px] text-[var(--color-text-tertiary)]">{formatCrores(s.impliedMarketCapCr)}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 pl-24 text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">
        <span className="ml-auto w-16 text-right">Probability</span>
        <span className="w-24 text-right">Price</span>
        <span className="w-28 text-right">Market Cap</span>
      </div>
    </div>
  );
}
