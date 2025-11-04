# app/models/unstructured_analysis.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UnstructuredAnalysis(Base):
    __tablename__ = "unstructured_analysis"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("call_logs.id", ondelete="CASCADE"))
    model_name = Column(String(50))
    sentiment = Column(String(20))
    tone = Column(String(30))
    intent_strength = Column(String(20))
    keywords = Column(JSON)
    pain_points = Column(Text)
    next_actions = Column(Text)
    summary_ai = Column(Text)
    confidence = Column(Float)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    call_log = relationship("CallLog", back_populates="unstructured_analyses")
    combined_analyses = relationship("CombinedAnalysis", back_populates="unstructured_analysis", cascade="all, delete")
    feature_keywords = relationship("FeatureStoreKeyword", back_populates="analysis", cascade="all, delete")
