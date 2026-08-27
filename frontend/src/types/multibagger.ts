import type { Verdict } from "./common";

export interface ScenarioProjection {
  multiple: 1 | 3 | 5 | 10;
  label: string;
  probabilityPct: number;
  impliedPrice: number;
  impliedMarketCapCr: number;
}

export interface FutureValueAssumption {
  label: string;
  current: string;
  potential: string;
}

export interface FutureValueModel {
  currentRevenueCr: number;
  potentialRevenueCr: number;
  currentEbitdaMarginPct: number;
  potentialEbitdaMarginPct: number;
  currentMarketCapCr: number;
  scenarioMarketCapCr: number;
  assumptions: FutureValueAssumption[];
}

export interface HistoricalAnalogue {
  company: string;
  similarityPct: number;
  whatHappened: string;
  maxReturnPct: number;
  period: string;
}

export interface MultibaggerCandidate {
  id: string;
  company: string;
  ticker: string;
  sector: string;
  price: number;
  marketCapCr: number;
  revenueGrowthPct: number;
  profitGrowthPct: number;
  rocePct: number;
  debtToEquity: number;
  growthAccelerationScore: number;
  catalystStrengthScore: number;
  marketMispricingScore: number;
  historicalSimilarityScore: number;
  governanceRiskScore: number;
  verdict: Verdict;
  confidencePct: number;
  scenarios: ScenarioProjection[];
  futureValue: FutureValueModel;
  analogues: HistoricalAnalogue[];
  bullThesis: string[];
  bearThesis: string[];
  catalysts: string[];
}
