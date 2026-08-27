import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import { formatCrores, formatPct } from "@/lib/formatters";
import type { MultibaggerCandidate } from "@/types/multibagger";

export function CandidateTable({ candidates, onSelect }: { candidates: MultibaggerCandidate[]; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <SectionLabel>Multibagger Candidates — {candidates.length} Companies</SectionLabel>
      <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-md)]">
        <table className="w-full min-w-[1280px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-inset)]">
              {["Company", "Mkt Cap", "Rev Growth", "Profit Growth", "ROCE", "Debt/Eq", "Growth Accel.", "Catalyst", "Mispricing", "Hist. Similarity", "Gov. Risk", "Verdict"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} onClick={() => onSelect(c.id)} className="cursor-pointer border-b border-[var(--color-border-hairline)] last:border-none hover:bg-[var(--color-bg-hover)] transition-colors">
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{c.company}</p>
                  <p className="font-mono-tabular text-[10.5px] text-[var(--color-text-tertiary)]">{c.ticker}</p>
                </td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-secondary)]">{formatCrores(c.marketCapCr)}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{formatPct(c.revenueGrowthPct, { signed: true })}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{formatPct(c.profitGrowthPct, { signed: true })}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-secondary)]">{c.rocePct.toFixed(1)}%</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{c.debtToEquity.toFixed(2)}×</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{c.growthAccelerationScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{c.catalystStrengthScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{c.marketMispricingScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{c.historicalSimilarityScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{c.governanceRiskScore}</td>
                <td className="px-3 py-2.5"><VerdictBadge verdict={c.verdict} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
