# app/models/combined_analysis.py
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class CombinedAnalysis(Base):
    __tablename__ = "combined_analysis"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"))
    officer_id = Column(Integer, ForeignKey("officers.id", ondelete="SET NULL"))
    structured_score_id = Column(Integer, ForeignKey("structured_scoring.id", ondelete="CASCADE"))
    unstructured_analysis_id = Column(Integer, ForeignKey("unstructured_analysis.id", ondelete="CASCADE"))
    overall_ai_score = Column(Float)
    conversion_probability = Column(Float)
    priority_level = Column(String(20))
    model_version = Column(String(20))
    last_updated = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="combined_analyses")
    officer = relationship("Officer", back_populates="combined_analyses")
    structured_score = relationship("StructuredScoring", back_populates="combined_analyses")
    unstructured_analysis = relationship("UnstructuredAnalysis", back_populates="combined_analyses")
