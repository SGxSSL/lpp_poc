# app/models/officer.py
from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    region = Column(String(50))
    specialty = Column(String(50))
    experience_years = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    call_logs = relationship("CallLog", back_populates="officer", cascade="all, delete")
    combined_analyses = relationship("CombinedAnalysis", back_populates="officer", cascade="all, delete-orphan")
    lead_scores = relationship("LeadScore", back_populates="officer", cascade="all, delete")
