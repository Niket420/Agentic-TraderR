import { motion } from "framer-motion";
import { Gavel } from "lucide-react";
import { VerdictBadge } from "@/components/common/Badge";
import { SectionLabel } from "@/components/common/EmptyState";
import type { ManagerEvaluation } from "@/types/research";

type LiveVerdict = ManagerEvaluation & { company: string; ticker: string };

export function ManagerPanel({ verdicts, active }: { verdicts: LiveVerdict[]; active: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gavel size={13} className="text-[var(--color-text-tertiary)]" />
        <SectionLabel>Manager — {active ? "Evaluating Thesis" : "Verdicts Issued"}</SectionLabel>
      </div>
      <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] divide-y divide-[var(--color-border-hairline)]">
        {verdicts.length === 0 ? (
          <p className="px-4 py-8 text-center text-[11px] text-[var(--color-text-disabled)]">Awaiting evidence synthesis…</p>
        ) : (
          verdicts.map((v) => (
            <motion.div key={v.ticker} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex items-center gap-4 px-4 py-2.5">
              <div className="w-40 shrink-0">
                <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{v.company}</p>
                <p className="font-mono-tabular text-[10px] text-[var(--color-text-tertiary)]">{v.ticker}</p>
              </div>
              <div className="grid flex-1 grid-cols-4 gap-3">
                {[
                  ["Thesis", v.thesisStrength],
                  ["Evidence", v.evidenceQuality],
                  ["Upside", v.upsidePotential],
                  ["Risk", v.risk],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-disabled)]">{label}</p>
                    <p className="font-mono-tabular text-[12px] text-[var(--color-text-secondary)]">{val}</p>
                  </div>
                ))}
              </div>
              <VerdictBadge verdict={v.verdict} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
