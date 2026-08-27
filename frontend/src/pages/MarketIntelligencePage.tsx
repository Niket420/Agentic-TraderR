import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Loader2 } from "lucide-react";
import { useResearchStore } from "@/store/researchStore";
import { WorkflowGraph } from "@/components/workflow/WorkflowGraph";
import { AgentRoom } from "@/components/agents/AgentRoom";
import { ManagerPanel } from "@/components/manager/ManagerPanel";
import { ResultsTable } from "@/components/results/ResultsTable";
import { CompanyDetailPanel } from "@/components/results/CompanyDetailPanel";
import { Button } from "@/components/common/Button";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { MARKET_INTELLIGENCE_WORKFLOW } from "@/lib/workflows";

export function MarketIntelligencePage() {
  const runStatus = useResearchStore((s) => s.runStatus);
  const nodes = useResearchStore((s) => s.nodes);
  const agents = useResearchStore((s) => s.agents);
  const liveVerdicts = useResearchStore((s) => s.liveVerdicts);
  const results = useResearchStore((s) => s.results);
  const summary = useResearchStore((s) => s.summary);
  const selectedResultId = useResearchStore((s) => s.selectedResultId);
  const selectResult = useResearchStore((s) => s.selectResult);
  const startRun = useResearchStore((s) => s.startRun);

  const running = runStatus === "running";
  const bullBearActive = nodes.bull_case?.status === "running" || nodes.bull_case?.status === "completed" || nodes.bear_case?.status === "running" || nodes.bear_case?.status === "completed";
  const managerActive = nodes.manager?.status === "running" || nodes.manager?.status === "completed";
  const hasResults = results.length > 0;
  const selectedResult = results.find((r) => r.id === selectedResultId) ?? null;
  const error = useResearchStore((s) => s.error);

  useEffect(() => {
    document.title = running ? "RUNNING — Market Intelligence // ALPHA" : "ALPHA // ENGINE";
  }, [running]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
            <Radar size={13} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Research Engine 01</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">MARKET INTELLIGENCE</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            Detect financially significant events, analyze their implications, challenge the thesis, and produce an investment view.
          </p>
        </div>
        <Button variant="command" size="lg" disabled={running} onClick={() => startRun()} icon={running ? <Loader2 size={15} className="animate-spin" /> : undefined}>
          {running ? "SCANNING" : "RUN MARKET SCAN"}
        </Button>
      </div>

      {runStatus === "failed" && error && <ErrorBanner message={error} />}

      {summary && (runStatus === "running" || runStatus === "completed") && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-[var(--color-border)] py-3 font-mono-tabular text-[11.5px] text-[var(--color-text-tertiary)]">
          <span>{summary.articlesScanned.toLocaleString()} articles scanned</span>
          <span className="text-[var(--color-text-disabled)]">·</span>
          <span>{summary.eventsDetected.toLocaleString()} events detected</span>
          <span className="text-[var(--color-text-disabled)]">·</span>
          <span>{summary.candidatesSelected} candidates selected</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <WorkflowGraph graph={MARKET_INTELLIGENCE_WORKFLOW} nodeStates={nodes} height={340} />
      </div>

      <AnimatePresence>
        {bullBearActive && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <AgentRoom bull={agents.bull} bear={agents.bear} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {managerActive && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <ManagerPanel verdicts={Object.values(liveVerdicts)} active={nodes.manager?.status === "running"} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <ResultsTable results={results} onSelect={selectResult} />
          </motion.div>
        )}
      </AnimatePresence>

      <CompanyDetailPanel result={selectedResult} onClose={() => selectResult(null)} />
    </div>
  );
}
