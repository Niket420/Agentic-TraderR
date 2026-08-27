import type { WorkflowNodeDef } from "@/types/common";

export interface WorkflowLayoutNode extends WorkflowNodeDef {
  x: number;
  y: number;
}

export interface WorkflowEdgeDef {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowGraphDef {
  nodes: WorkflowLayoutNode[];
  edges: WorkflowEdgeDef[];
}

/** Market Intelligence — a branching research pipeline: analyst fans out
 * into competing Bull / Bear theses that re-converge at verification. */
export const MARKET_INTELLIGENCE_WORKFLOW: WorkflowGraphDef = {
  nodes: [
    { id: "news_collection", label: "NEWS COLLECTION", hint: "Ingest financial news sources", x: 420, y: 0 },
    { id: "fact_extraction", label: "FACT EXTRACTION", hint: "Structure raw events", x: 420, y: 120, dependsOn: ["news_collection"] },
    { id: "research_analyst", label: "RESEARCH ANALYST", hint: "Screen candidate events", x: 420, y: 240, dependsOn: ["fact_extraction"] },
    { id: "bull_case", label: "BULL CASE", hint: "Build the long thesis", x: 200, y: 380, dependsOn: ["research_analyst"] },
    { id: "bear_case", label: "BEAR CASE", hint: "Build the counter-thesis", x: 640, y: 380, dependsOn: ["research_analyst"] },
    { id: "evidence_verification", label: "EVIDENCE CHECK", hint: "Cross-verify citations", x: 420, y: 520, dependsOn: ["bull_case", "bear_case"] },
    { id: "manager", label: "MANAGER", hint: "Weigh the debate", x: 420, y: 640, dependsOn: ["evidence_verification"] },
    { id: "final_view", label: "INVESTMENT VIEW", hint: "Publish the verdict", x: 420, y: 760, dependsOn: ["manager"] },
  ],
  edges: [
    { id: "e1", source: "news_collection", target: "fact_extraction" },
    { id: "e2", source: "fact_extraction", target: "research_analyst" },
    { id: "e3", source: "research_analyst", target: "bull_case" },
    { id: "e4", source: "research_analyst", target: "bear_case" },
    { id: "e5", source: "bull_case", target: "evidence_verification" },
    { id: "e6", source: "bear_case", target: "evidence_verification" },
    { id: "e7", source: "evidence_verification", target: "manager" },
    { id: "e8", source: "manager", target: "final_view" },
  ],
};

/** Multibagger Engine — a horizontal discovery chain, deliberately a
 * different topology and orientation from Market Intelligence so it
 * reads as a distinct research architecture rather than a re-skinned
 * page. */
export const MULTIBAGGER_WORKFLOW: WorkflowGraphDef = {
  nodes: [
    { id: "market_universe", label: "MARKET UNIVERSE", hint: "Screen the investable universe", x: 0, y: 0 },
    { id: "financial_quality", label: "FINANCIAL QUALITY", hint: "Filter for balance-sheet strength", x: 280, y: 0, dependsOn: ["market_universe"] },
    { id: "growth_inflection", label: "GROWTH INFLECTION", hint: "Detect acceleration points", x: 560, y: 0, dependsOn: ["financial_quality"] },
    { id: "catalyst_detection", label: "CATALYST DETECTION", hint: "Identify forward triggers", x: 840, y: 0, dependsOn: ["growth_inflection"] },
    { id: "future_value_model", label: "FUTURE VALUE MODEL", hint: "Project earnings power", x: 1120, y: 0, dependsOn: ["catalyst_detection"] },
    { id: "mispricing_analysis", label: "MISPRICING ANALYSIS", hint: "Compare value to price", x: 1400, y: 0, dependsOn: ["future_value_model"] },
    { id: "historical_pattern_match", label: "HISTORICAL PATTERN MATCH", hint: "Match analogous setups", x: 1680, y: 0, dependsOn: ["mispricing_analysis"] },
    { id: "bull_research", label: "BULL RESEARCH", hint: "Build the asymmetric case", x: 1960, y: 0, dependsOn: ["historical_pattern_match"] },
    { id: "bear_research", label: "BEAR RESEARCH", hint: "Stress-test the case", x: 2240, y: 0, dependsOn: ["bull_research"] },
    { id: "multibagger_judge", label: "MULTIBAGGER JUDGE", hint: "Score the opportunity", x: 2520, y: 0, dependsOn: ["bear_research"] },
  ],
  edges: [
    { id: "m1", source: "market_universe", target: "financial_quality" },
    { id: "m2", source: "financial_quality", target: "growth_inflection" },
    { id: "m3", source: "growth_inflection", target: "catalyst_detection" },
    { id: "m4", source: "catalyst_detection", target: "future_value_model" },
    { id: "m5", source: "future_value_model", target: "mispricing_analysis" },
    { id: "m6", source: "mispricing_analysis", target: "historical_pattern_match" },
    { id: "m7", source: "historical_pattern_match", target: "bull_research" },
    { id: "m8", source: "bull_research", target: "bear_research" },
    { id: "m9", source: "bear_research", target: "multibagger_judge" },
  ],
};
