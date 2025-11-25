# app/models/lead_score.py
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class LeadScore(Base):
    __tablename__ = "lead_scores"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id", ondelete="CASCADE"))
    score = Column(Float, nullable=False)
    reason = Column(Text)
    version = Column(Integer, default=1)  # Version number for this score
    total_calls_analyzed = Column(Integer, default=0)  # Number of calls used for this score
    call_ids_snapshot = Column(JSON)  # List of call IDs that were analyzed for this version
    created_at = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="lead_scores")
    officer = relationship("Officer", back_populates="lead_scores")
