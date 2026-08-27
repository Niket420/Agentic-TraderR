import { SlideOver } from "@/components/common/SlideOver";
import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import { ScenarioViz } from "./ScenarioViz";
import { FutureValueViz } from "./FutureValueViz";
import { HistoricalAnalogues } from "./HistoricalAnalogues";
import { formatCrores, formatPrice } from "@/lib/formatters";
import type { MultibaggerCandidate } from "@/types/multibagger";

export function CandidateDetailPanel({ candidate, onClose }: { candidate: MultibaggerCandidate | null; onClose: () => void }) {
  return (
    <SlideOver
      open={!!candidate}
      onClose={onClose}
      width="xl"
      title={candidate ? `${candidate.company} — ${candidate.ticker}` : ""}
      subtitle={candidate?.sector}
      headerRight={candidate && <VerdictBadge verdict={candidate.verdict} />}
    >
      {candidate && (
        <div className="space-y-8 px-6 py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Price" value={formatPrice(candidate.price)} />
            <Stat label="Market Cap" value={formatCrores(candidate.marketCapCr)} />
            <Stat label="ROCE" value={`${candidate.rocePct.toFixed(1)}%`} />
            <Stat label="Confidence" value={`${candidate.confidencePct}%`} />
          </div>

          <ScenarioViz scenarios={candidate.scenarios} />
          <FutureValueViz model={candidate.futureValue} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <SectionLabel>Bull Thesis</SectionLabel>
              <ul className="mt-2 space-y-2.5">
                {candidate.bullThesis.map((t, i) => (
                  <li key={i} className="border-l-2 border-l-[var(--color-accent)] pl-3 text-[12.5px] leading-relaxed text-[var(--color-text-primary)]">{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel>Bear Thesis</SectionLabel>
              <ul className="mt-2 space-y-2.5">
                {candidate.bearThesis.map((t, i) => (
                  <li key={i} className="border-l-2 border-l-[var(--color-text-tertiary)] pl-3 text-[12.5px] leading-relaxed text-[var(--color-text-primary)]">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionLabel>Catalysts</SectionLabel>
            <ul className="mt-2 space-y-1.5">
              {candidate.catalysts.map((c, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <HistoricalAnalogues analogues={candidate.analogues} />
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
