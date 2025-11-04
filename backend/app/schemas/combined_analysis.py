# app/schemas/combined_analysis.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CombinedAnalysisBase(BaseModel):
    lead_id: Optional[int] = None
    officer_id: Optional[int] = None
    structured_score_id: Optional[int] = None
    unstructured_analysis_id: Optional[int] = None
    overall_ai_score: Optional[float] = None
    conversion_probability: Optional[float] = None
    priority_level: Optional[str] = None
    model_version: Optional[str] = None
    last_updated: Optional[datetime] = None


class CombinedAnalysisCreate(CombinedAnalysisBase):
    pass


class CombinedAnalysisOut(CombinedAnalysisBase):
    id: int

    class Config:
        orm_mode = True
