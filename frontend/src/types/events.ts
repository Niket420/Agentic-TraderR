import type { ISODateString } from "./common";

/**
 * Execution event architecture.
 *
 * These are the discrete event types the Python backend will eventually
 * stream over WebSocket / SSE while a research run executes. The frontend
 * never manages its own fake timers for domain state — every state
 * transition (workflow node status, agent messages, logs, results) is
 * derived by feeding events of this shape into the run reducer, whether
 * they come from the mock engine or a real socket.
 */
export type RunEngine = "market_intelligence" | "multibagger";

interface BaseEvent {
  id: string;
  runId: string;
  engine: RunEngine;
  timestamp: ISODateString;
}

export interface RunStartedEvent extends BaseEvent {
  type: "run.started";
  payload: { totalStages: number };
}

export interface RunCompletedEvent extends BaseEvent {
  type: "run.completed";
  payload: { resultCount: number };
}

export interface RunFailedEvent extends BaseEvent {
  type: "run.failed";
  payload: { reason: string; nodeId?: string };
}

export interface StageStartedEvent extends BaseEvent {
  type: "stage.started";
  payload: { nodeId: string; detail?: string };
}

export interface StageProgressEvent extends BaseEvent {
  type: "stage.progress";
  payload: { nodeId: string; detail: string };
}

export interface StageCompletedEvent extends BaseEvent {
  type: "stage.completed";
  payload: { nodeId: string; resultLabel?: string };
}

export interface StageFailedEvent extends BaseEvent {
  type: "stage.failed";
  payload: { nodeId: string; reason: string };
}

export interface AgentMessageEvent extends BaseEvent {
  type: "agent.message";
  payload: {
    agent: "bull" | "bear";
    company: string;
    ticker: string;
    hypothesis?: string;
    text: string;
    citations: string[];
  };
}

export interface ManagerScoreEvent extends BaseEvent {
  type: "manager.evaluated";
  payload: {
    company: string;
    ticker: string;
    thesisStrength: number;
    evidenceQuality: number;
    upsidePotential: number;
    risk: number;
    verdict: "BUY" | "WATCH" | "PASS";
    reasons: string[];
    invalidationConditions: string[];
  };
}

export interface LogEmittedEvent extends BaseEvent {
  type: "log.emitted";
  payload: { source: string; message: string; level: "info" | "running" | "success" | "warning" | "error" };
}

export type ExecutionEvent =
  | RunStartedEvent
  | RunCompletedEvent
  | RunFailedEvent
  | StageStartedEvent
  | StageProgressEvent
  | StageCompletedEvent
  | StageFailedEvent
  | AgentMessageEvent
  | ManagerScoreEvent
  | LogEmittedEvent;

export type ExecutionEventType = ExecutionEvent["type"];

/** Handler signature consumed by run stores when replaying a stream. */
export type ExecutionEventListener = (event: ExecutionEvent) => void;
