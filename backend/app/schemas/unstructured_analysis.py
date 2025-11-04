# app/schemas/unstructured_analysis.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class UnstructuredAnalysisBase(BaseModel):
    call_id: Optional[int] = None
    model_name: Optional[str] = None
    sentiment: Optional[str] = None
    tone: Optional[str] = None
    intent_strength: Optional[str] = None
    keywords: Optional[Any] = None  # JSON field
    pain_points: Optional[str] = None
    next_actions: Optional[str] = None
    summary_ai: Optional[str] = None
    confidence: Optional[float] = None


class UnstructuredAnalysisCreate(UnstructuredAnalysisBase):
    pass


class UnstructuredAnalysisUpdate(UnstructuredAnalysisBase):
    pass


class UnstructuredAnalysisOut(UnstructuredAnalysisBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True