export type ISODateString = string;

export type NodeStatus = "idle" | "waiting" | "running" | "completed" | "failed";

export interface WorkflowNodeDef {
  id: string;
  label: string;
  /** short subtitle shown under the label, e.g. an agent role hint */
  hint?: string;
  /** ids of nodes that must complete before this one can start */
  dependsOn?: string[];
}

export interface WorkflowNodeState {
  status: NodeStatus;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  /** short result readout, e.g. "1,284 articles" */
  resultLabel?: string;
  /** longer status line shown while running, e.g. "Analyzing 47 companies" */
  detail?: string;
}

export type LogLevel = "info" | "running" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  timestamp: ISODateString;
  source: string;
  message: string;
  level: LogLevel;
}

export type RunStatus = "idle" | "running" | "completed" | "failed";

export type Verdict = "BUY" | "WATCH" | "PASS";
