import type { ISODateString, Verdict } from "./common";

export interface AgentMessage {
  id: string;
  agent: "bull" | "bear";
  company: string;
  ticker: string;
  text: string;
  timestamp: ISODateString;
  citations: string[];
}

export type AgentStatus = "waiting" | "active" | "concluded";

export interface AgentState {
  status: AgentStatus;
  currentCompany?: string;
  currentTicker?: string;
  currentHypothesis?: string;
  evidenceCount: number;
  messages: AgentMessage[];
}

export interface ManagerEvaluation {
  thesisStrength: number;
  evidenceQuality: number;
  upsidePotential: number;
  risk: number;
  verdict: Verdict;
  reasons: string[];
  invalidationConditions: string[];
}

export interface ResearchResult {
  id: string;
  company: string;
  ticker: string;
  sector: string;
  price: number;
  marketCapCr: number;
  event: string;
  eventDate: ISODateString;
  significance: string;
  bullScore: number;
  bearScore: number;
  managerScore: number;
  potentialReturnPct: number;
  riskScore: number;
  confidencePct: number;
  evidenceCount: number;
  verdict: Verdict;
  manager: ManagerEvaluation;
  bullThesis: string[];
  bearThesis: string[];
  evidence: EvidenceItem[];
  historicalComparables: HistoricalComparable[];
  news: NewsItem[];
}

export interface EvidenceItem {
  id: string;
  label: string;
  source: string;
  strength: "supporting" | "contradicting" | "neutral";
  citedBy: "bull" | "bear" | "verification";
}

export interface HistoricalComparable {
  company: string;
  event: string;
  outcome: string;
  returnPct: number;
  period: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: ISODateString;
  summary: string;
}

export interface ResearchRunSummary {
  articlesScanned: number;
  eventsDetected: number;
  candidatesSelected: number;
  runDurationSec: number;
}
