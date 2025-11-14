# app/schemas/feature_store_keyword.py
from pydantic import BaseModel
from typing import Optional


class FeatureStoreKeywordBase(BaseModel):
    analysis_id: Optional[int] = None
    keyword: Optional[str] = None
    frequency: Optional[int] = None
    sentiment_context: Optional[str] = None


class FeatureStoreKeywordCreate(FeatureStoreKeywordBase):
    pass


class FeatureStoreKeywordOut(FeatureStoreKeywordBase):
    id: int

    class Config:
        from_attributes = True
