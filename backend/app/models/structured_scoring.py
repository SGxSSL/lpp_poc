# app/models/structured_scoring.py
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class StructuredScoring(Base):
    __tablename__ = "structured_scoring"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    total_calls = Column(Integer)
    avg_call_duration = Column(Float)
    recency_days = Column(Integer)
    lead_activity_score = Column(Float)
    officer_performance_score = Column(Float)
    structured_score = Column(Float)
    generated_at = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="structured_scores")
    combined_analyses = relationship("CombinedAnalysis", back_populates="structured_score", cascade="all, delete")
