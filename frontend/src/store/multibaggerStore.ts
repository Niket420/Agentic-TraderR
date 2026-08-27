import { create } from "zustand";
import { multibaggerApi } from "@/api/multibagger";
import { useLogStore } from "./logStore";
import { MULTIBAGGER_WORKFLOW } from "@/lib/workflows";
import type { RunStatus, WorkflowNodeState } from "@/types/common";
import type { ExecutionEvent } from "@/types/events";
import type { AgentMessage, AgentState } from "@/types/research";
import type { MultibaggerCandidate } from "@/types/multibagger";

function emptyNodes(): Record<string, WorkflowNodeState> {
  const nodes: Record<string, WorkflowNodeState> = {};
  for (const n of MULTIBAGGER_WORKFLOW.nodes) nodes[n.id] = { status: "idle" };
  return nodes;
}

function emptyAgent(): AgentState {
  return { status: "waiting", evidenceCount: 0, messages: [] };
}

let msgSeq = 0;

interface MultibaggerState {
  runId: string | null;
  runStatus: RunStatus;
  nodes: Record<string, WorkflowNodeState>;
  agents: { bull: AgentState; bear: AgentState };
  candidates: MultibaggerCandidate[];
  selectedCandidateId: string | null;
  error: string | null;
  unsubscribe: (() => void) | null;

  startRun: () => Promise<void>;
  reset: () => void;
  selectCandidate: (id: string | null) => void;
}

function applyEvent(event: ExecutionEvent, get: () => MultibaggerState, set: (partial: Partial<MultibaggerState>) => void) {
  const state = get();
  switch (event.type) {
    case "run.started": {
      const nodes: Record<string, WorkflowNodeState> = {};
      for (const n of MULTIBAGGER_WORKFLOW.nodes) nodes[n.id] = { status: "waiting" };
      set({ runStatus: "running", nodes, agents: { bull: emptyAgent(), bear: emptyAgent() }, candidates: [], error: null });
      break;
    }
    case "stage.started":
      set({ nodes: { ...state.nodes, [event.payload.nodeId]: { status: "running", startedAt: event.timestamp, detail: event.payload.detail } } });
      break;
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
        id: `mb-msg-${Date.now()}-${msgSeq}`,
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
    case "log.emitted": {
      useLogStore.getState().add({ timestamp: event.timestamp, source: event.payload.source, message: event.payload.message, level: event.payload.level });
      break;
    }
    case "run.completed": {
      set({ runStatus: "completed", agents: { bull: { ...state.agents.bull, status: "concluded" }, bear: { ...state.agents.bear, status: "concluded" } } });
      multibaggerApi.getCandidates().then((candidates) => set({ candidates }));
      break;
    }
    case "run.failed":
      set({ runStatus: "failed", error: event.payload.reason });
      break;
  }
}

export const useMultibaggerStore = create<MultibaggerState>((set, get) => ({
  runId: null,
  runStatus: "idle",
  nodes: emptyNodes(),
  agents: { bull: emptyAgent(), bear: emptyAgent() },
  candidates: [],
  selectedCandidateId: null,
  error: null,
  unsubscribe: null,

  startRun: async () => {
    get().unsubscribe?.();
    const { runId } = await multibaggerApi.startRun();
    const unsubscribe = multibaggerApi.subscribeToRunEvents(runId, (event) => applyEvent(event, get, (p) => set(p)));
    set({ runId, unsubscribe, runStatus: "running", selectedCandidateId: null });
  },

  reset: () => {
    get().unsubscribe?.();
    set({ runId: null, runStatus: "idle", nodes: emptyNodes(), agents: { bull: emptyAgent(), bear: emptyAgent() }, candidates: [], selectedCandidateId: null, error: null, unsubscribe: null });
  },

  selectCandidate: (id) => set({ selectedCandidateId: id }),
}));
