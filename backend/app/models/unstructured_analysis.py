# app/models/unstructured_analysis.py
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, func, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class UnstructuredAnalysis(Base):
    __tablename__ = "unstructured_analysis"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("call_logs.id", ondelete="CASCADE"))
    model_name = Column(String(50))

    # Core extracted fields
    sentiment = Column(String(20))
    tone = Column(String(50))
    intent_type = Column(String(50))
    intent_strength = Column(String(20))
    decision_stage = Column(String(50))
    conversion_probability = Column(Float)

    # Deep semantic info
    keywords = Column(JSON)
    topics_discussed = Column(JSON)
    entity_mentions = Column(JSON)
    speech_acts = Column(JSON)
    discourse_relations = Column(JSON)
    framing_style = Column(String(50))
    deception_markers = Column(JSON)

    # Emotional & conversational metrics
    pain_points = Column(Text)
    objections = Column(Text)
    clarity_score = Column(Float)
    trust_score = Column(Float)
    emotion_profile = Column(JSON)
    dominant_emotion = Column(String(30))
    empathy_score = Column(Float)
    politeness_level = Column(Float)
    formality_level = Column(Float)

    # Conversation structure
    next_actions = Column(Text)
    followup_priority = Column(String(20))
    conversation_phases = Column(JSON)
    cooperation_index = Column(Float)
    dominance_score = Column(JSON)
    talk_ratio = Column(JSON)
    interruptions = Column(Integer)
    response_latency = Column(Float)

    # Summaries and outcomes
    summary_ai = Column(Text)
    outcome_classification = Column(String(50))
    highlights = Column(JSON)
    themes = Column(JSON)

    # General metadata
    confidence = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    call_log = relationship("CallLog", back_populates="unstructured_analyses")
    combined_analyses = relationship(
        "CombinedAnalysis",
        back_populates="unstructured_analysis",
        cascade="all, delete"
    )
    feature_keywords = relationship(
        "FeatureStoreKeyword",
        back_populates="analysis",
        cascade="all, delete"
    )
