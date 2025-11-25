# app/schemas/lead_score.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class LeadScoreBase(BaseModel):
    lead_id: int
    officer_id: int
    score: float
    reason: Optional[str] = None


class LeadScoreCreate(LeadScoreBase):
    version: Optional[int] = 1
    total_calls_analyzed: Optional[int] = 0
    call_ids_snapshot: Optional[List[int]] = None


class LeadScoreOut(LeadScoreBase):
    id: int
    version: int
    total_calls_analyzed: int
    call_ids_snapshot: Optional[List[int]] = None
    created_at: datetime
    last_updated: datetime

    class Config:
        from_attributes = True
