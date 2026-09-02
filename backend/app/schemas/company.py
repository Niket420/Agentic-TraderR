from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    isin: str | None
    nse_symbol: str | None
    bse_code: str | None
    name: str
    status: str
    created_at: datetime
    updated_at: datetime
