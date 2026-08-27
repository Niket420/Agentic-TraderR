import { create } from "zustand";
import { researchApi } from "@/api/research";
import { useLogStore } from "./logStore";
import { MARKET_INTELLIGENCE_WORKFLOW } from "@/lib/workflows";
import type { RunStatus, WorkflowNodeState } from "@/types/common";
import type { ExecutionEvent } from "@/types/events";
import type { AgentMessage, AgentState, ManagerEvaluation, ResearchResult, ResearchRunSummary } from "@/types/research";

function emptyNodes(): Record<string, WorkflowNodeState> {
  const nodes: Record<string, WorkflowNodeState> = {};
  for (const n of MARKET_INTELLIGENCE_WORKFLOW.nodes) nodes[n.id] = { status: "idle" };
  return nodes;
}

function emptyAgent(): AgentState {
  return { status: "waiting", evidenceCount: 0, messages: [] };
}

let msgSeq = 0;

interface ResearchState {
  runId: string | null;
  runStatus: RunStatus;
  startedAt: string | null;
  nodes: Record<string, WorkflowNodeState>;
  agents: { bull: AgentState; bear: AgentState };
  liveVerdicts: Record<string, ManagerEvaluation & { company: string; ticker: string }>;
  results: ResearchResult[];
  summary: ResearchRunSummary | null;
  selectedResultId: string | null;
  error: string | null;
  unsubscribe: (() => void) | null;

  startRun: () => Promise<void>;
  reset: () => void;
  selectResult: (id: string | null) => void;
}

function applyEvent(event: ExecutionEvent, get: () => ResearchState, set: (partial: Partial<ResearchState>) => void) {
  const state = get();

  switch (event.type) {
    case "run.started": {
      const nodes = emptyNodes();
      for (const n of MARKET_INTELLIGENCE_WORKFLOW.nodes) nodes[n.id] = { status: "waiting" };
      set({ runStatus: "running", nodes, agents: { bull: emptyAgent(), bear: emptyAgent() }, results: [], liveVerdicts: {}, startedAt: event.timestamp, error: null });
      break;
    }
    case "stage.started": {
      set({ nodes: { ...state.nodes, [event.payload.nodeId]: { status: "running", startedAt: event.timestamp, detail: event.payload.detail } } });
      break;
    }
    case "stage.progress": {
      const prev = state.nodes[event.payload.nodeId];
      set({ nodes: { ...state.nodes, [event.payload.nodeId]: { ...prev, detail: event.payload.detail } } });
      break;
    }
    case "stage.completed": {
      const prev = state.nodes[event.payload.nodeId];
      set({ nodes: { ...state.nodes, [event.payload.nodeId]: { ...prev, status: "completed", completedAt: event.timestamp, resultLabel: event.payload.resultLabel } } });
      break;
    }
    case "stage.failed": {
      const prev = state.nodes[event.payload.nodeId];
      set({ nodes: { ...state.nodes, [event.payload.nodeId]: { ...prev, status: "failed", detail: event.payload.reason } } });
      break;
    }
    case "agent.message": {
      msgSeq += 1;
      const message: AgentMessage = {
        id: `msg-${Date.now()}-${msgSeq}`,
        agent: event.payload.agent,
        company: event.payload.company,
        ticker: event.payload.ticker,
        text: event.payload.text,
        timestamp: event.timestamp,
        citations: event.payload.citations,
      };
      const key = event.payload.agent;
      const prevAgent = state.agents[key];
      set({
        agents: {
          ...state.agents,
          [key]: {
            status: "active",
            currentCompany: event.payload.company,
            currentTicker: event.payload.ticker,
            currentHypothesis: event.payload.hypothesis,
            evidenceCount: prevAgent.evidenceCount + event.payload.citations.length,
            messages: [...prevAgent.messages, message],
          },
        },
      });
      break;
    }
    case "manager.evaluated": {
      set({
        liveVerdicts: {
          ...state.liveVerdicts,
          [event.payload.ticker]: {
            company: event.payload.company,
            ticker: event.payload.ticker,
            thesisStrength: event.payload.thesisStrength,
            evidenceQuality: event.payload.evidenceQuality,
            upsidePotential: event.payload.upsidePotential,
            risk: event.payload.risk,
            verdict: event.payload.verdict,
            reasons: event.payload.reasons,
            invalidationConditions: event.payload.invalidationConditions,
          },
        },
      });
      break;
    }
    case "log.emitted": {
      useLogStore.getState().add({ timestamp: event.timestamp, source: event.payload.source, message: event.payload.message, level: event.payload.level });
      break;
    }
    case "run.completed": {
      set({ runStatus: "completed", agents: { bull: { ...state.agents.bull, status: "concluded" }, bear: { ...state.agents.bear, status: "concluded" } } });
      researchApi.getResults().then((results) => set({ results }));
      researchApi.getRunSummary(state.runId ?? "").then((summary) => set({ summary }));
      break;
    }
    case "run.failed": {
      set({ runStatus: "failed", error: event.payload.reason });
      break;
    }
  }
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  runId: null,
  runStatus: "idle",
  startedAt: null,
  nodes: emptyNodes(),
  agents: { bull: emptyAgent(), bear: emptyAgent() },
  liveVerdicts: {},
  results: [],
  summary: null,
  selectedResultId: null,
  error: null,
  unsubscribe: null,

  startRun: async () => {
    get().unsubscribe?.();
    const { runId } = await researchApi.startRun();
    const unsubscribe = researchApi.subscribeToRunEvents(runId, (event) => applyEvent(event, get, (p) => set(p)));
    set({ runId, unsubscribe, runStatus: "running", selectedResultId: null });
  },

  reset: () => {
    get().unsubscribe?.();
    set({ runId: null, runStatus: "idle", nodes: emptyNodes(), agents: { bull: emptyAgent(), bear: emptyAgent() }, liveVerdicts: {}, results: [], summary: null, selectedResultId: null, error: null, unsubscribe: null });
  },

  selectResult: (id) => set({ selectedResultId: id }),
}));
