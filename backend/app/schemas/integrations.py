from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IntegrationProvider(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    category: str
    name: str
    description: str
    status: str
    masked_key: str | None = Field(default=None, alias="maskedKey")
    last_tested_at: datetime | None = Field(default=None, alias="lastTestedAt")


class SaveCredentialPayload(BaseModel):
    api_key: str = Field(alias="apiKey")
    model_config = ConfigDict(populate_by_name=True)


class ConnectionStatusResponse(BaseModel):
    status: str
