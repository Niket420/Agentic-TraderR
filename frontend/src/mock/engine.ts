import type { ExecutionEvent, RunEngine } from "@/types/events";
import type { ResearchResult } from "@/types/research";
import type { MultibaggerCandidate } from "@/types/multibagger";

type DraftEvent = Omit<ExecutionEvent, "id" | "runId" | "engine" | "timestamp">;

interface ScriptStep {
  delayMs: number;
  event: DraftEvent;
}

let seq = 0;
function nextId(): string {
  seq += 1;
  return `evt-${Date.now()}-${seq}`;
}

function log(source: string, message: string, level: "info" | "running" | "success" | "warning" | "error" = "info"): DraftEvent {
  return { type: "log.emitted", payload: { source, message, level } };
}

/** Builds the timed event script for a Market Intelligence run driven by
 * a fixed set of mock results. Message content is sourced directly from
 * each result's bull/bear thesis and manager evaluation so the debate and
 * final verdicts stay internally consistent with the results table. */
export function buildMarketIntelligenceScript(results: ResearchResult[]): ScriptStep[] {
  const steps: ScriptStep[] = [];
  const push = (delayMs: number, event: DraftEvent) => steps.push({ delayMs, event });

  push(0, { type: "run.started", payload: { totalStages: 8 } });
  push(0, log("SYSTEM", "Run initiated", "info"));

  push(200, { type: "stage.started", payload: { nodeId: "news_collection", detail: "Scanning 40+ financial news sources" } });
  push(200, log("NEWS", "Fetching financial news", "running"));
  push(1400, { type: "stage.progress", payload: { nodeId: "news_collection", detail: "Normalizing article feed" } });
  push(1000, { type: "stage.completed", payload: { nodeId: "news_collection", resultLabel: "1,284 articles" } });
  push(0, log("NEWS", "1,284 articles retrieved", "success"));

  push(300, { type: "stage.started", payload: { nodeId: "fact_extraction", detail: "Extracting structured events" } });
  push(300, log("FILTER", "Extracting financially significant events", "running"));
  push(1300, { type: "stage.completed", payload: { nodeId: "fact_extraction", resultLabel: "143 relevant events" } });
  push(0, log("FILTER", "143 relevant events detected", "success"));

  push(300, { type: "stage.started", payload: { nodeId: "research_analyst", detail: `Analyzing ${results.length * 8} companies` } });
  push(300, log("ANALYST", "Research Analyst activated", "running"));
  push(1500, { type: "stage.progress", payload: { nodeId: "research_analyst", detail: `Shortlisting ${results.length} candidate events` } });
  push(1200, { type: "stage.completed", payload: { nodeId: "research_analyst", resultLabel: `${results.length} companies selected` } });
  push(0, log("ANALYST", `${results.length} companies selected for deeper analysis`, "success"));

  push(300, { type: "stage.started", payload: { nodeId: "bull_case", detail: `Building the long thesis across ${results.length} names` } });
  push(0, log("BULL", "Bull Researcher activated", "running"));
  push(200, { type: "stage.started", payload: { nodeId: "bear_case", detail: `Stress-testing each thesis` } });
  push(0, log("BEAR", "Bear Researcher activated", "running"));

  for (const r of results) {
    const rounds = Math.max(r.bullThesis.length, r.bearThesis.length);
    for (let i = 0; i < rounds; i++) {
      if (r.bullThesis[i]) {
        push(950, {
          type: "agent.message",
          payload: { agent: "bull", company: r.company, ticker: r.ticker, hypothesis: r.event, text: r.bullThesis[i], citations: r.evidence.filter((e) => e.citedBy === "bull").map((e) => e.id) },
        });
        push(0, log("BULL", `${r.ticker} — ${r.bullThesis[i].slice(0, 64)}${r.bullThesis[i].length > 64 ? "…" : ""}`, "info"));
      }
      if (r.bearThesis[i]) {
        push(950, {
          type: "agent.message",
          payload: { agent: "bear", company: r.company, ticker: r.ticker, hypothesis: r.event, text: r.bearThesis[i], citations: r.evidence.filter((e) => e.citedBy === "bear").map((e) => e.id) },
        });
        push(0, log("BEAR", `${r.ticker} — ${r.bearThesis[i].slice(0, 64)}${r.bearThesis[i].length > 64 ? "…" : ""}`, "info"));
      }
    }
  }

  push(500, { type: "stage.completed", payload: { nodeId: "bull_case", resultLabel: `${results.length} theses built` } });
  push(0, { type: "stage.completed", payload: { nodeId: "bear_case", resultLabel: `${results.length} counter-theses built` } });

  push(300, { type: "stage.started", payload: { nodeId: "evidence_verification", detail: "Cross-checking citations against source filings" } });
  push(0, log("VERIFY", "Evidence verification started", "running"));
  push(1600, { type: "stage.completed", payload: { nodeId: "evidence_verification", resultLabel: `${results.reduce((a, r) => a + r.evidenceCount, 0)} citations verified` } });
  push(0, log("VERIFY", "Evidence cross-verification complete", "success"));

  push(300, { type: "stage.started", payload: { nodeId: "manager", detail: "Weighing bull/bear evidence per company" } });
  push(0, log("MANAGER", "Evidence evaluation started", "running"));
  for (const r of results) {
    push(700, {
      type: "manager.evaluated",
      payload: {
        company: r.company,
        ticker: r.ticker,
        thesisStrength: r.manager.thesisStrength,
        evidenceQuality: r.manager.evidenceQuality,
        upsidePotential: r.manager.upsidePotential,
        risk: r.manager.risk,
        verdict: r.manager.verdict,
        reasons: r.manager.reasons,
        invalidationConditions: r.manager.invalidationConditions,
      },
    });
    push(0, log("MANAGER", `${r.ticker} — verdict: ${r.manager.verdict}`, "info"));
  }
  push(400, { type: "stage.completed", payload: { nodeId: "manager", resultLabel: `${results.length} verdicts issued` } });

  push(300, { type: "stage.started", payload: { nodeId: "final_view", detail: "Publishing investment views" } });
  push(700, { type: "stage.completed", payload: { nodeId: "final_view", resultLabel: `${results.length} companies` } });
  push(0, log("SYSTEM", "Investment views published", "success"));

  push(300, { type: "run.completed", payload: { resultCount: results.length } });
  push(0, log("SYSTEM", "Run completed", "success"));

  return steps;
}

export function buildMultibaggerScript(candidates: MultibaggerCandidate[]): ScriptStep[] {
  const steps: ScriptStep[] = [];
  const push = (delayMs: number, event: DraftEvent) => steps.push({ delayMs, event });

  push(0, { type: "run.started", payload: { totalStages: 10 } });
  push(0, log("SYSTEM", "Multibagger scan initiated", "info"));

  const funnel: Array<[string, string, number, string]> = [
    ["market_universe", "Screening the investable universe", 4218, "companies screened"],
    ["financial_quality", "Filtering for balance-sheet strength", 612, "pass quality filter"],
    ["growth_inflection", "Detecting growth acceleration points", 214, "show growth inflection"],
    ["catalyst_detection", "Identifying forward catalysts", 88, "have an identifiable catalyst"],
    ["future_value_model", "Projecting future earnings power", 88, "future value models built"],
    ["mispricing_analysis", "Comparing intrinsic value to market price", 46, "flagged as mispriced"],
    ["historical_pattern_match", "Matching against historical analogues", candidates.length + 9, "matched to historical patterns"],
  ];

  for (const [nodeId, detail, count, suffix] of funnel) {
    push(300, { type: "stage.started", payload: { nodeId, detail } });
    push(0, log(nodeId.toUpperCase().split("_")[0], detail, "running"));
    push(1100, { type: "stage.completed", payload: { nodeId, resultLabel: `${count.toLocaleString()} ${suffix}` } });
    push(0, log(nodeId.toUpperCase().split("_")[0], `${count.toLocaleString()} ${suffix}`, "success"));
  }

  push(300, { type: "stage.started", payload: { nodeId: "bull_research", detail: `Building the asymmetric case for ${candidates.length} names` } });
  push(0, log("BULL", "Bull Researcher activated", "running"));
  push(200, { type: "stage.started", payload: { nodeId: "bear_research", detail: "Stress-testing each opportunity" } });
  push(0, log("BEAR", "Bear Researcher activated", "running"));

  for (const c of candidates) {
    for (const t of c.bullThesis) {
      push(900, { type: "agent.message", payload: { agent: "bull", company: c.company, ticker: c.ticker, hypothesis: c.catalysts[0], text: t, citations: [] } });
      push(0, log("BULL", `${c.ticker} — ${t.slice(0, 64)}${t.length > 64 ? "…" : ""}`, "info"));
    }
    for (const t of c.bearThesis) {
      push(900, { type: "agent.message", payload: { agent: "bear", company: c.company, ticker: c.ticker, hypothesis: c.catalysts[0], text: t, citations: [] } });
      push(0, log("BEAR", `${c.ticker} — ${t.slice(0, 64)}${t.length > 64 ? "…" : ""}`, "info"));
    }
  }

  push(500, { type: "stage.completed", payload: { nodeId: "bull_research", resultLabel: `${candidates.length} theses built` } });
  push(0, { type: "stage.completed", payload: { nodeId: "bear_research", resultLabel: `${candidates.length} counter-theses built` } });

  push(300, { type: "stage.started", payload: { nodeId: "multibagger_judge", detail: "Scoring asymmetric opportunity" } });
  push(0, log("JUDGE", "Multibagger Judge activated", "running"));
  push(1400, { type: "stage.completed", payload: { nodeId: "multibagger_judge", resultLabel: `${candidates.length} candidates ranked` } });
  push(0, log("JUDGE", `${candidates.length} candidates ranked`, "success"));

  push(300, { type: "run.completed", payload: { resultCount: candidates.length } });
  push(0, log("SYSTEM", "Run completed", "success"));

  return steps;
}

export interface RunHandle {
  cancel: () => void;
}

/** Plays a pre-built script against a listener, stamping each event with
 * id/runId/engine/timestamp at emit time — mirroring how a real socket
 * consumer would receive fully-formed ExecutionEvents from the backend. */
export function playScript(engine: RunEngine, runId: string, steps: ScriptStep[], onEvent: (event: ExecutionEvent) => void): RunHandle {
  let cancelled = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cumulative = 0;

  for (const step of steps) {
    cumulative += step.delayMs;
    const t = setTimeout(() => {
      if (cancelled) return;
      const full: ExecutionEvent = {
        ...step.event,
        id: nextId(),
        runId,
        engine,
        timestamp: new Date().toISOString(),
      } as ExecutionEvent;
      onEvent(full);
    }, cumulative);
    timeouts.push(t);
  }

  return {
    cancel: () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    },
  };
}
