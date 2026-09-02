from pydantic import BaseModel, ConfigDict, Field


class ScenarioProjection(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    multiple: int
    label: str
    probability_pct: float = Field(alias="probabilityPct")
    implied_price: float = Field(alias="impliedPrice")
    implied_market_cap_cr: float = Field(alias="impliedMarketCapCr")


class FutureValueAssumption(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    label: str
    current: str
    potential: str


class FutureValueModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    current_revenue_cr: float = Field(alias="currentRevenueCr")
    potential_revenue_cr: float = Field(alias="potentialRevenueCr")
    current_ebitda_margin_pct: float = Field(alias="currentEbitdaMarginPct")
    potential_ebitda_margin_pct: float = Field(alias="potentialEbitdaMarginPct")
    current_market_cap_cr: float = Field(alias="currentMarketCapCr")
    scenario_market_cap_cr: float = Field(alias="scenarioMarketCapCr")
    assumptions: list[FutureValueAssumption]


class HistoricalAnalogue(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    company: str
    similarity_pct: float = Field(alias="similarityPct")
    what_happened: str = Field(alias="whatHappened")
    max_return_pct: float = Field(alias="maxReturnPct")
    period: str


class MultibaggerCandidate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    company: str
    ticker: str
    sector: str
    price: float
    market_cap_cr: float = Field(alias="marketCapCr")
    revenue_growth_pct: float = Field(alias="revenueGrowthPct")
    profit_growth_pct: float = Field(alias="profitGrowthPct")
    roce_pct: float = Field(alias="rocePct")
    debt_to_equity: float = Field(alias="debtToEquity")
    growth_acceleration_score: float = Field(alias="growthAccelerationScore")
    catalyst_strength_score: float = Field(alias="catalystStrengthScore")
    market_mispricing_score: float = Field(alias="marketMispricingScore")
    historical_similarity_score: float = Field(alias="historicalSimilarityScore")
    governance_risk_score: float = Field(alias="governanceRiskScore")
    verdict: str
    confidence_pct: float = Field(alias="confidencePct")
    scenarios: list[ScenarioProjection]
    future_value: FutureValueModel = Field(alias="futureValue")
    analogues: list[HistoricalAnalogue]
    bull_thesis: list[str] = Field(alias="bullThesis")
    bear_thesis: list[str] = Field(alias="bearThesis")
    catalysts: list[str]
