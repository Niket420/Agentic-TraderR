import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import { formatCrores, formatDate, formatPct, formatPrice } from "@/lib/formatters";
import type { ResearchResult } from "@/types/research";

export function ResultsTable({ results, onSelect }: { results: ResearchResult[]; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Research Results — {results.length} Companies</SectionLabel>
      </div>
      <div className="overflow-x-auto border border-[var(--color-border)] rounded-[var(--radius-md)]">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-inset)]">
              {["Company", "Ticker", "Price", "Mkt Cap", "Event", "Date", "Bull", "Bear", "Mgr", "Return", "Risk", "Conf.", "Evid.", "Verdict"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="cursor-pointer border-b border-[var(--color-border-hairline)] last:border-none hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <td className="px-3 py-2.5 text-[12px] font-medium text-[var(--color-text-primary)] whitespace-nowrap">{r.company}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{r.ticker}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-secondary)]">{formatPrice(r.price)}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-secondary)]">{formatCrores(r.marketCapCr)}</td>
                <td className="max-w-[220px] truncate px-3 py-2.5 text-[11.5px] text-[var(--color-text-secondary)]" title={r.event}>{r.event}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11px] text-[var(--color-text-tertiary)] whitespace-nowrap">{formatDate(r.eventDate)}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{r.bullScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{r.bearScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{r.managerScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-primary)]">{formatPct(r.potentialReturnPct, { signed: true })}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{r.riskScore}</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{r.confidencePct}%</td>
                <td className="px-3 py-2.5 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">{r.evidenceCount}</td>
                <td className="px-3 py-2.5"><VerdictBadge verdict={r.verdict} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
