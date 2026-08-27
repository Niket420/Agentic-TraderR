import { useState } from "react";
import { SlideOver } from "@/components/common/SlideOver";
import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import { ManagerEvaluationDetail } from "@/components/manager/ManagerEvaluationDetail";
import { cn } from "@/lib/cn";
import { formatCrores, formatDate, formatDateTime, formatPct, formatPrice } from "@/lib/formatters";
import type { ResearchResult } from "@/types/research";

const TABS = ["Overview", "Financials", "News", "Bull Thesis", "Bear Thesis", "Manager Decision", "Evidence", "Comparables"] as const;
type Tab = (typeof TABS)[number];

export function CompanyDetailPanel({ result, onClose }: { result: ResearchResult | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <SlideOver
      open={!!result}
      onClose={onClose}
      width="xl"
      title={result ? `${result.company} — ${result.ticker}` : ""}
      subtitle={result?.sector}
      headerRight={result && <VerdictBadge verdict={result.verdict} />}
    >
      {result && (
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--color-border)] px-6">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors",
                  tab === t ? "border-[var(--color-accent)] text-[var(--color-text-primary)]" : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Price" value={formatPrice(result.price)} />
                  <Stat label="Market Cap" value={formatCrores(result.marketCapCr)} />
                  <Stat label="Potential Return" value={formatPct(result.potentialReturnPct, { signed: true })} />
                  <Stat label="Confidence" value={`${result.confidencePct}%`} />
                </div>
                <div>
                  <SectionLabel>Event</SectionLabel>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-primary)]">{result.event}</p>
                  <p className="mt-1 font-mono-tabular text-[11px] text-[var(--color-text-tertiary)]">{formatDate(result.eventDate)}</p>
                </div>
                <div>
                  <SectionLabel>Fundamental Significance</SectionLabel>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{result.significance}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="Bull Score" value={String(result.bullScore)} />
                  <Stat label="Bear Score" value={String(result.bearScore)} />
                  <Stat label="Manager Score" value={String(result.managerScore)} />
                </div>
              </div>
            )}

            {tab === "Financials" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Stat label="Sector" value={result.sector} />
                  <Stat label="Price" value={formatPrice(result.price)} />
                  <Stat label="Market Cap" value={formatCrores(result.marketCapCr)} />
                  <Stat label="Risk Score" value={String(result.riskScore)} />
                  <Stat label="Evidence Items" value={String(result.evidenceCount)} />
                  <Stat label="Verdict" value={result.verdict} />
                </div>
                <p className="text-[11.5px] text-[var(--color-text-disabled)]">
                  Full financial statements connect via the Financial Fundamentals API once configured in API &amp; Integrations.
                </p>
              </div>
            )}

            {tab === "News" && (
              <div className="space-y-4">
                {result.news.map((n) => (
                  <div key={n.id} className="border-b border-[var(--color-border-hairline)] pb-4 last:border-none">
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{n.headline}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{n.summary}</p>
                    <p className="mt-1.5 font-mono-tabular text-[10.5px] text-[var(--color-text-disabled)]">{n.source} · {formatDateTime(n.publishedAt)}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "Bull Thesis" && (
              <ul className="space-y-3">
                {result.bullThesis.map((t, i) => (
                  <li key={i} className="border-l-2 border-l-[var(--color-accent)] pl-3 text-[13px] leading-relaxed text-[var(--color-text-primary)]">{t}</li>
                ))}
              </ul>
            )}

            {tab === "Bear Thesis" && (
              <ul className="space-y-3">
                {result.bearThesis.map((t, i) => (
                  <li key={i} className="border-l-2 border-l-[var(--color-text-tertiary)] pl-3 text-[13px] leading-relaxed text-[var(--color-text-primary)]">{t}</li>
                ))}
              </ul>
            )}

            {tab === "Manager Decision" && <ManagerEvaluationDetail evaluation={result.manager} />}

            {tab === "Evidence" && (
              <div className="space-y-2">
                {result.evidence.map((e) => (
                  <div key={e.id} className="flex items-start justify-between gap-3 border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2.5">
                    <div>
                      <p className="text-[12px] text-[var(--color-text-primary)]">{e.label}</p>
                      <p className="mt-1 font-mono-tabular text-[10px] text-[var(--color-text-disabled)]">{e.source}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em]",
                        e.strength === "supporting" && "border-[var(--color-accent)] text-[var(--color-accent)]",
                        e.strength === "contradicting" && "border-[var(--color-border-strong)] text-[var(--color-text-tertiary)]",
                        e.strength === "neutral" && "border-[var(--color-border)] text-[var(--color-text-disabled)]",
                      )}
                    >
                      {e.citedBy}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "Comparables" && (
              <div className="space-y-3">
                {result.historicalComparables.map((c, i) => (
                  <div key={i} className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{c.company}</p>
                      <span className="font-mono-tabular text-[12px] font-semibold text-[var(--color-text-primary)]">{formatPct(c.returnPct, { signed: true })}</span>
                    </div>
                    <p className="mt-1 text-[11.5px] text-[var(--color-text-tertiary)]">{c.event}</p>
                    <p className="mt-1.5 text-[12px] text-[var(--color-text-secondary)]">{c.outcome}</p>
                    <p className="mt-1 font-mono-tabular text-[10.5px] text-[var(--color-text-disabled)]">{c.period}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">{label}</p>
      <p className="mt-1 font-mono-tabular text-[15px] font-semibold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
