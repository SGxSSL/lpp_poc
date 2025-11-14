from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any

class OfficerBase(BaseModel):
    id: int
    name: str
    region: Optional[str] = None
    specialty: Optional[str] = None
    experience_years: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class UnstructuredAnalysisBase(BaseModel):
    id: int
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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CallLogBase(BaseModel):
    id: int
    lead_id: Optional[int] = None
    officer_id: Optional[int] = None
    call_date: datetime
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    channel: Optional[str] = None
    transcription: Optional[str] = None
    summary: Optional[str] = None
    intent: Optional[str] = None
    objections: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime
    officer: Optional[OfficerBase] = None
    unstructured_analyses: List[UnstructuredAnalysisBase] = []

    class Config:
        from_attributes = True

class LeadDetailResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    credit_score: Optional[int] = None
    interest_level: Optional[int] = None
    last_contact_date: Optional[datetime] = None
    source: Optional[str] = None
    status: Optional[str] = None
    lead_type: Optional[str] = None
    created_at: datetime
    call_logs: List[CallLogBase] = []

    class Config:
        from_attributes = True