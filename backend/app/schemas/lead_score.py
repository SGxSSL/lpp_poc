# app/schemas/lead_score.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LeadScoreBase(BaseModel):
    lead_id: int
    officer_id: int
    score: float
    reason: Optional[str] = None


class LeadScoreCreate(LeadScoreBase):
    pass


class LeadScoreOut(LeadScoreBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True
