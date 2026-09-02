from pydantic import BaseModel, ConfigDict, Field

Verdict = str  # "BUY" | "WATCH" | "PASS"


class ManagerEvaluation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    thesis_strength: float = Field(alias="thesisStrength")
    evidence_quality: float = Field(alias="evidenceQuality")
    upside_potential: float = Field(alias="upsidePotential")
    risk: float
    verdict: Verdict
    reasons: list[str]
    invalidation_conditions: list[str] = Field(alias="invalidationConditions")


class EvidenceItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    label: str
    source: str
    strength: str
    cited_by: str = Field(alias="citedBy")


class HistoricalComparable(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    company: str
    event: str
    outcome: str
    return_pct: float = Field(alias="returnPct")
    period: str


class NewsItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    headline: str
    source: str
    published_at: str = Field(alias="publishedAt")
    summary: str


class ResearchResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    company: str
    ticker: str
    sector: str
    price: float
    market_cap_cr: float = Field(alias="marketCapCr")
    event: str
    event_date: str = Field(alias="eventDate")
    significance: str
    bull_score: float = Field(alias="bullScore")
    bear_score: float = Field(alias="bearScore")
    manager_score: float = Field(alias="managerScore")
    potential_return_pct: float = Field(alias="potentialReturnPct")
    risk_score: float = Field(alias="riskScore")
    confidence_pct: float = Field(alias="confidencePct")
    evidence_count: int = Field(alias="evidenceCount")
    verdict: Verdict
    manager: ManagerEvaluation
    bull_thesis: list[str] = Field(alias="bullThesis")
    bear_thesis: list[str] = Field(alias="bearThesis")
    evidence: list[EvidenceItem]
    historical_comparables: list[HistoricalComparable] = Field(alias="historicalComparables")
    news: list[NewsItem]


class ResearchRunSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    articles_scanned: int = Field(alias="articlesScanned")
    events_detected: int = Field(alias="eventsDetected")
    candidates_selected: int = Field(alias="candidatesSelected")
    run_duration_sec: float = Field(alias="runDurationSec")


class StartRunResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    run_id: str = Field(alias="runId")
