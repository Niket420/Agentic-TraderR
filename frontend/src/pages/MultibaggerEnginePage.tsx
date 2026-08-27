import { AnimatePresence, motion } from "framer-motion";
import { Rocket, Loader2 } from "lucide-react";
import { useMultibaggerStore } from "@/store/multibaggerStore";
import { WorkflowGraph } from "@/components/workflow/WorkflowGraph";
import { AgentRoom } from "@/components/agents/AgentRoom";
import { CandidateTable } from "@/components/multibagger/CandidateTable";
import { CandidateDetailPanel } from "@/components/multibagger/CandidateDetailPanel";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { MULTIBAGGER_WORKFLOW } from "@/lib/workflows";

export function MultibaggerEnginePage() {
  const runStatus = useMultibaggerStore((s) => s.runStatus);
  const nodes = useMultibaggerStore((s) => s.nodes);
  const agents = useMultibaggerStore((s) => s.agents);
  const candidates = useMultibaggerStore((s) => s.candidates);
  const selectedCandidateId = useMultibaggerStore((s) => s.selectedCandidateId);
  const selectCandidate = useMultibaggerStore((s) => s.selectCandidate);
  const startRun = useMultibaggerStore((s) => s.startRun);

  const running = runStatus === "running";
  const bullBearActive = nodes.bull_research?.status === "running" || nodes.bull_research?.status === "completed" || nodes.bear_research?.status === "running" || nodes.bear_research?.status === "completed";
  const hasCandidates = candidates.length > 0;
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) ?? null;
  const error = useMultibaggerStore((s) => s.error);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
            <Rocket size={13} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Research Engine 02</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">MULTIBAGGER ENGINE</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Find small companies where future earning power may be materially larger than what the current valuation implies.
          </p>
        </div>
        <Button variant="command" size="lg" disabled={running} onClick={() => startRun()} icon={running ? <Loader2 size={15} className="animate-spin" /> : undefined}>
          {running ? "SCANNING" : "RUN MULTIBAGGER SCAN"}
        </Button>
      </div>

      {runStatus === "failed" && error && <ErrorBanner message={error} />}

      <div className="overflow-x-auto">
        <WorkflowGraph graph={MULTIBAGGER_WORKFLOW} nodeStates={nodes} direction="horizontal" height={280} />
      </div>

      <AnimatePresence>
        {bullBearActive && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <AgentRoom bull={agents.bull} bear={agents.bear} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasCandidates && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <CandidateTable candidates={candidates} onSelect={selectCandidate} />
          </motion.div>
        )}
      </AnimatePresence>

      <CandidateDetailPanel candidate={selectedCandidate} onClose={() => selectCandidate(null)} />
    </div>
  );
}
