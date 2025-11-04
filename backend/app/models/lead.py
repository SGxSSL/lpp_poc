# app/models/lead.py
from sqlalchemy import Column, Integer, String, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(50))
    credit_score = Column(Integer)
    interest_level = Column(Integer)
    last_contact_date = Column(Date)
    source = Column(String(50))
    status = Column(String(50))
    lead_type = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    call_logs = relationship("CallLog", back_populates="lead", cascade="all, delete")
    structured_scores = relationship("StructuredScoring", back_populates="lead", cascade="all, delete")
    combined_analyses = relationship("CombinedAnalysis", back_populates="lead", cascade="all, delete")
    lead_scores = relationship("LeadScore", back_populates="lead", cascade="all, delete")
