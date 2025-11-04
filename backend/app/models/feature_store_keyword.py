# app/models/feature_store_keyword.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class FeatureStoreKeyword(Base):
    __tablename__ = "feature_store_keywords"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("unstructured_analysis.id", ondelete="CASCADE"))
    keyword = Column(String(100))
    frequency = Column(Integer)
    sentiment_context = Column(String(20))

    # Relationships
    analysis = relationship("UnstructuredAnalysis", back_populates="feature_keywords")
