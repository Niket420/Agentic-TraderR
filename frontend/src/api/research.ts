import { apiConfig, request, openEventStream } from "./client";
import { buildMarketIntelligenceScript, playScript, type RunHandle } from "@/mock/engine";
import { RESEARCH_RESULTS } from "@/mock/data/researchResults";
import type { ExecutionEvent } from "@/types/events";
import type { ResearchResult, ResearchRunSummary } from "@/types/research";

export interface StartRunResponse {
  runId: string;
}

let mockHandle: RunHandle | null = null;

/**
 * Domain service for the Market Intelligence engine.
 *
 * Endpoint shape this mirrors on the Python backend:
 *   POST /research/run                 -> { runId }
 *   GET  /research/runs/:id            -> ResearchRunSummary
 *   GET  /research/runs/:id/events     -> WebSocket stream of ExecutionEvent
 *   GET  /research/runs/:id/results    -> ResearchResult[]
 */
export const researchApi = {
  async startRun(): Promise<StartRunResponse> {
    if (apiConfig.useMocks) {
      return { runId: `run-mi-${Date.now()}` };
    }
    return request<StartRunResponse>("/research/run", { method: "POST" });
  },

  subscribeToRunEvents(runId: string, onEvent: (event: ExecutionEvent) => void): () => void {
    if (apiConfig.useMocks) {
      mockHandle?.cancel();
      const steps = buildMarketIntelligenceScript(RESEARCH_RESULTS);
      mockHandle = playScript("market_intelligence", runId, steps, onEvent);
      return () => mockHandle?.cancel();
    }
    return openEventStream(`/research/runs/${runId}/events`, (raw) => onEvent(JSON.parse(raw) as ExecutionEvent));
  },

  async getResults(): Promise<ResearchResult[]> {
    if (apiConfig.useMocks) return RESEARCH_RESULTS;
    return request<ResearchResult[]>(`/research/results`);
  },

  async getRunSummary(runId: string): Promise<ResearchRunSummary> {
    if (apiConfig.useMocks) {
      return { articlesScanned: 1284, eventsDetected: 143, candidatesSelected: RESEARCH_RESULTS.length, runDurationSec: 62 };
    }
    return request<ResearchRunSummary>(`/research/runs/${runId}`);
  },
};
