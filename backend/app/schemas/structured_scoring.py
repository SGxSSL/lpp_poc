# app/schemas/structured_scoring.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StructuredScoringBase(BaseModel):
    lead_id: Optional[int] = None
    total_calls: Optional[int] = None
    avg_call_duration: Optional[float] = None
    recency_days: Optional[int] = None
    lead_activity_score: Optional[float] = None
    officer_performance_score: Optional[float] = None
    structured_score: Optional[float] = None


class StructuredScoringCreate(StructuredScoringBase):
    pass


class StructuredScoringUpdate(StructuredScoringBase):
    pass


class StructuredScoringOut(StructuredScoringBase):
    id: int
    generated_at: datetime

    class Config:
        orm_mode = True
