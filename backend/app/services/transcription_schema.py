# app/services/transcription_schema.py
from typing import List
from pydantic import BaseModel, Field

class Keyword(BaseModel):
    keyword: str = Field(..., description="Main keyword from the call")
    frequency: int = Field(..., description="Count of keyword occurrences")
    sentiment_context: str = Field(..., description="Positive / Negative / Neutral")

class TranscriptionAnalysisSchema(BaseModel):
    sentiment: str
    tone: str
    intent_strength: str
    keywords: List[Keyword]
    pain_points: str
    next_actions: str
    summary_ai: str
    confidence: float
