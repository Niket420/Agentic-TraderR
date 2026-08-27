import { ShieldAlert, Sparkles } from "lucide-react";
import { ScoreBar } from "./ScoreBar";
import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import type { ManagerEvaluation } from "@/types/research";

export function ManagerEvaluationDetail({ evaluation }: { evaluation: ManagerEvaluation }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <ScoreBar label="Thesis Strength" value={evaluation.thesisStrength} />
        <ScoreBar label="Evidence Quality" value={evaluation.evidenceQuality} />
        <ScoreBar label="Upside Potential" value={evaluation.upsidePotential} />
        <ScoreBar label="Risk" value={evaluation.risk} invert />
      </div>

      <div className="flex items-center justify-between border-y border-[var(--color-border)] py-3">
        <SectionLabel>Final View</SectionLabel>
        <VerdictBadge verdict={evaluation.verdict} />
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-[var(--color-text-tertiary)]" />
          <SectionLabel>Why?</SectionLabel>
        </div>
        <ul className="space-y-1.5">
          {evaluation.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldAlert size={12} className="text-[var(--color-text-tertiary)]" />
          <SectionLabel>Invalidation Conditions</SectionLabel>
        </div>
        <ul className="space-y-1.5">
          {evaluation.invalidationConditions.map((r, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
