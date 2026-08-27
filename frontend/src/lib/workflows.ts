import {
  Newspaper,
  FileSearch,
  Microscope,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Gavel,
  Target,
  Globe,
  LineChart,
  Zap,
  Sparkles,
  Scale,
  History,
  type LucideIcon,
} from "lucide-react";
import type { WorkflowNodeDef } from "@/types/common";

export interface WorkflowLayoutNode extends WorkflowNodeDef {
  x: number;
  y: number;
  icon: LucideIcon;
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

const STEP = 300;

/** Market Intelligence — a horizontal research pipeline: the analyst
 * fans out into competing Bull / Bear theses running side by side,
 * which re-converge before verification. */
export const MARKET_INTELLIGENCE_WORKFLOW: WorkflowGraphDef = {
  nodes: [
    { id: "news_collection", label: "NEWS COLLECTION", hint: "Ingest financial news sources", x: 0, y: 90, icon: Newspaper },
    { id: "fact_extraction", label: "FACT EXTRACTION", hint: "Structure raw events", x: STEP, y: 90, dependsOn: ["news_collection"], icon: FileSearch },
    { id: "research_analyst", label: "RESEARCH ANALYST", hint: "Screen candidate events", x: STEP * 2, y: 90, dependsOn: ["fact_extraction"], icon: Microscope },
    { id: "bull_case", label: "BULL CASE", hint: "Build the long thesis", x: STEP * 3, y: 0, dependsOn: ["research_analyst"], icon: TrendingUp },
    { id: "bear_case", label: "BEAR CASE", hint: "Build the counter-thesis", x: STEP * 3, y: 200, dependsOn: ["research_analyst"], icon: TrendingDown },
    { id: "evidence_verification", label: "EVIDENCE CHECK", hint: "Cross-verify citations", x: STEP * 4, y: 90, dependsOn: ["bull_case", "bear_case"], icon: ShieldCheck },
    { id: "manager", label: "MANAGER", hint: "Weigh the debate", x: STEP * 5, y: 90, dependsOn: ["evidence_verification"], icon: Gavel },
    { id: "final_view", label: "INVESTMENT VIEW", hint: "Publish the verdict", x: STEP * 6, y: 90, dependsOn: ["manager"], icon: Target },
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

/** Multibagger Engine — a straight horizontal discovery chain, kept
 * topologically distinct (no branch) from Market Intelligence so it
 * reads as a different research architecture rather than a re-skinned
 * page. */
export const MULTIBAGGER_WORKFLOW: WorkflowGraphDef = {
  nodes: [
    { id: "market_universe", label: "MARKET UNIVERSE", hint: "Screen the investable universe", x: 0, y: 0, icon: Globe },
    { id: "financial_quality", label: "FINANCIAL QUALITY", hint: "Filter for balance-sheet strength", x: STEP, y: 0, dependsOn: ["market_universe"], icon: ShieldCheck },
    { id: "growth_inflection", label: "GROWTH INFLECTION", hint: "Detect acceleration points", x: STEP * 2, y: 0, dependsOn: ["financial_quality"], icon: LineChart },
    { id: "catalyst_detection", label: "CATALYST DETECTION", hint: "Identify forward triggers", x: STEP * 3, y: 0, dependsOn: ["growth_inflection"], icon: Zap },
    { id: "future_value_model", label: "FUTURE VALUE MODEL", hint: "Project earnings power", x: STEP * 4, y: 0, dependsOn: ["catalyst_detection"], icon: Sparkles },
    { id: "mispricing_analysis", label: "MISPRICING ANALYSIS", hint: "Compare value to price", x: STEP * 5, y: 0, dependsOn: ["future_value_model"], icon: Scale },
    { id: "historical_pattern_match", label: "HISTORICAL PATTERN MATCH", hint: "Match analogous setups", x: STEP * 6, y: 0, dependsOn: ["mispricing_analysis"], icon: History },
    { id: "bull_research", label: "BULL RESEARCH", hint: "Build the asymmetric case", x: STEP * 7, y: 0, dependsOn: ["historical_pattern_match"], icon: TrendingUp },
    { id: "bear_research", label: "BEAR RESEARCH", hint: "Stress-test the case", x: STEP * 8, y: 0, dependsOn: ["bull_research"], icon: TrendingDown },
    { id: "multibagger_judge", label: "MULTIBAGGER JUDGE", hint: "Score the opportunity", x: STEP * 9, y: 0, dependsOn: ["bear_research"], icon: Gavel },
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
