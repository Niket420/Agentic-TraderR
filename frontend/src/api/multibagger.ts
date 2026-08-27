import { apiConfig, request, openEventStream } from "./client";
import { buildMultibaggerScript, playScript, type RunHandle } from "@/mock/engine";
import { MULTIBAGGER_CANDIDATES } from "@/mock/data/multibaggerCandidates";
import type { ExecutionEvent } from "@/types/events";
import type { MultibaggerCandidate } from "@/types/multibagger";

export interface StartRunResponse {
  runId: string;
}

let mockHandle: RunHandle | null = null;

/**
 * Domain service for the Multibagger Engine.
 *
 *   POST /multibagger/run                -> { runId }
 *   GET  /multibagger/runs/:id           -> run summary
 *   GET  /multibagger/runs/:id/events    -> WebSocket stream of ExecutionEvent
 *   GET  /multibagger/runs/:id/candidates -> MultibaggerCandidate[]
 */
export const multibaggerApi = {
  async startRun(): Promise<StartRunResponse> {
    if (apiConfig.useMocks) {
      return { runId: `run-mb-${Date.now()}` };
    }
    return request<StartRunResponse>("/multibagger/run", { method: "POST" });
  },

  subscribeToRunEvents(runId: string, onEvent: (event: ExecutionEvent) => void): () => void {
    if (apiConfig.useMocks) {
      mockHandle?.cancel();
      const steps = buildMultibaggerScript(MULTIBAGGER_CANDIDATES);
      mockHandle = playScript("multibagger", runId, steps, onEvent);
      return () => mockHandle?.cancel();
    }
    return openEventStream(`/multibagger/runs/${runId}/events`, (raw) => onEvent(JSON.parse(raw) as ExecutionEvent));
  },

  async getCandidates(): Promise<MultibaggerCandidate[]> {
    if (apiConfig.useMocks) return MULTIBAGGER_CANDIDATES;
    return request<MultibaggerCandidate[]>(`/multibagger/candidates`);
  },
};
