# app/models/lead_score.py
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class LeadScore(Base):
    __tablename__ = "lead_scores"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id", ondelete="CASCADE"))
    score = Column(Float, nullable=False)
    reason = Column(Text)
    last_updated = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="lead_scores")
    officer = relationship("Officer", back_populates="lead_scores")
