# app/models/call_log.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class CallLog(Base):
    __tablename__ = "call_logs"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id", ondelete="CASCADE"))
    call_date = Column(DateTime, server_default=func.now())
    duration_minutes = Column(Integer)
    outcome = Column(String(50))
    channel = Column(String(50))
    transcription = Column(Text)
    summary = Column(Text)
    intent = Column(String(100))
    objections = Column(Text)
    sentiment = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="call_logs")
    officer = relationship("Officer", back_populates="call_logs")
    unstructured_analyses = relationship("UnstructuredAnalysis", back_populates="call_log", cascade="all, delete")
