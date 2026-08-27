import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/common/EmptyState";
import { formatCrores } from "@/lib/formatters";
import type { FutureValueModel } from "@/types/multibagger";

export function FutureValueViz({ model }: { model: FutureValueModel }) {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <SectionLabel>Future Value Model</SectionLabel>
        <span className="text-[10px] text-[var(--color-text-disabled)]">A scenario, not a prediction</span>
      </div>

      <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-5">
        <div className="flex-1">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Current Market Cap</p>
          <p className="mt-1 font-mono-tabular text-xl font-bold text-[var(--color-text-primary)]">{formatCrores(model.currentMarketCapCr)}</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[var(--color-text-tertiary)]" />
        <div className="flex-1 text-right">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Scenario Market Cap</p>
          <p className="mt-1 font-mono-tabular text-xl font-bold text-[var(--color-accent)]">{formatCrores(model.scenarioMarketCapCr)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Current Revenue</p>
          <p className="mt-1 font-mono-tabular text-[16px] font-semibold text-[var(--color-text-primary)]">{formatCrores(model.currentRevenueCr)}</p>
        </div>
        <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Potential Revenue</p>
          <p className="mt-1 font-mono-tabular text-[16px] font-semibold text-[var(--color-accent)]">{formatCrores(model.potentialRevenueCr)}</p>
        </div>
        <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Current EBITDA Margin</p>
          <p className="mt-1 font-mono-tabular text-[16px] font-semibold text-[var(--color-text-primary)]">{model.currentEbitdaMarginPct.toFixed(1)}%</p>
        </div>
        <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3">
          <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">Potential EBITDA Margin</p>
          <p className="mt-1 font-mono-tabular text-[16px] font-semibold text-[var(--color-accent)]">{model.potentialEbitdaMarginPct.toFixed(1)}%</p>
        </div>
      </div>

      <div>
        <SectionLabel>Assumptions</SectionLabel>
        <div className="mt-2 divide-y divide-[var(--color-border-hairline)] border border-[var(--color-border)] rounded-[var(--radius-sm)]">
          {model.assumptions.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span className="text-[11.5px] text-[var(--color-text-secondary)]">{a.label}</span>
              <span className="flex items-center gap-2 font-mono-tabular text-[11.5px]">
                <span className="text-[var(--color-text-tertiary)]">{a.current}</span>
                <ArrowRight size={11} className="text-[var(--color-text-disabled)]" />
                <span className="font-semibold text-[var(--color-text-primary)]">{a.potential}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
