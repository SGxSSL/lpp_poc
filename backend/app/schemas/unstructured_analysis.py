# app/schemas/unstructured_analysis.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class UnstructuredAnalysisBase(BaseModel):
    call_id: Optional[int] = None
    model_name: Optional[str] = None
    sentiment: Optional[str] = None
    tone: Optional[str] = None
    intent_type: Optional[str] = None
    intent_strength: Optional[str] = None
    decision_stage: Optional[str] = None
    conversion_probability: Optional[float] = None
    keywords: Optional[Any] = None
    topics_discussed: Optional[Any] = None
    entity_mentions: Optional[Any] = None
    speech_acts: Optional[Any] = None
    discourse_relations: Optional[Any] = None
    framing_style: Optional[str] = None
    deception_markers: Optional[Any] = None
    pain_points: Optional[str] = None
    objections: Optional[str] = None
    clarity_score: Optional[float] = None
    trust_score: Optional[float] = None
    emotion_profile: Optional[Any] = None
    dominant_emotion: Optional[str] = None
    empathy_score: Optional[float] = None
    politeness_level: Optional[float] = None
    formality_level: Optional[float] = None
    next_actions: Optional[str] = None
    followup_priority: Optional[str] = None
    conversation_phases: Optional[Any] = None
    cooperation_index: Optional[float] = None
    dominance_score: Optional[Any] = None
    talk_ratio: Optional[Any] = None
    interruptions: Optional[int] = None
    response_latency: Optional[float] = None
    summary_ai: Optional[str] = None
    outcome_classification: Optional[str] = None
    highlights: Optional[Any] = None
    themes: Optional[Any] = None
    confidence: Optional[float] = None


class UnstructuredAnalysisCreate(UnstructuredAnalysisBase):
    pass


class UnstructuredAnalysisUpdate(UnstructuredAnalysisBase):
    pass


class UnstructuredAnalysisOut(UnstructuredAnalysisBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True