from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DashboardMetrics(BaseModel):
    total_leads: int
    active_leads: int
    hot_leads: int
    avg_credit_score: float
    total_calls: int
    analyzed_calls: int
    avg_conversion_probability: Optional[float] = None
    avg_trust_score: Optional[float] = None
    avg_clarity_score: Optional[float] = None
    avg_empathy_score: Optional[float] = None
    avg_cooperation_index: Optional[float] = None
    avg_interruptions: Optional[float] = None

    class Config:
        from_attributes = True


class StatusDistribution(BaseModel):
    status: str
    count: int


class TypeDistribution(BaseModel):
    lead_type: str
    count: int


class InterestDistribution(BaseModel):
    level: str
    count: int


class CreditScoreDistribution(BaseModel):
    bucket: str
    count: int


class SentimentDistribution(BaseModel):
    sentiment: str
    count: int


class DecisionStageDistribution(BaseModel):
    stage: str
    count: int
    avg_conversion_prob: Optional[float] = None


class IntentStrengthDistribution(BaseModel):
    strength: str
    count: int


class EmotionDistribution(BaseModel):
    emotion: str
    count: int


class FollowUpPriorityDistribution(BaseModel):
    priority: str
    count: int


class ConversionTrend(BaseModel):
    date: str
    avg_conversion: float
    count: int


class TrustTrend(BaseModel):
    date: str
    avg_trust: float
    count: int


class RiskOpportunitySegment(BaseModel):
    segment: str  # hot_prospects, risky_opportunities, nurture_candidates, deprioritize
    count: int
    avg_conversion: float
    avg_trust: float


class TopKeyword(BaseModel):
    keyword: str
    frequency: int


class TopPainPoint(BaseModel):
    pain_point: str
    frequency: int


class NextActionDistribution(BaseModel):
    action: str
    count: int


class PriorityLead(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    lead_type: Optional[str] = None
    status: Optional[str] = None
    interest_level: Optional[int] = None
    credit_score: Optional[int] = None
    source: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    created_at: datetime
    conversion_probability: Optional[float] = None
    trust_score: Optional[float] = None

    class Config:
        from_attributes = True


class RecentActivity(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    lead_type: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    activity_type: str  # 'new_lead', 'call_analyzed', 'lead_scored'
    description: Optional[str] = None

    class Config:
        from_attributes = True


class DashboardAnalytics(BaseModel):
    status_distribution: List[StatusDistribution]
    type_distribution: List[TypeDistribution]
    interest_distribution: List[InterestDistribution]
    credit_distribution: List[CreditScoreDistribution]
    sentiment_distribution: List[SentimentDistribution]
    decision_stage_distribution: List[DecisionStageDistribution]
    intent_strength_distribution: List[IntentStrengthDistribution]
    emotion_distribution: List[EmotionDistribution]
    followup_priority_distribution: List[FollowUpPriorityDistribution]
    conversion_trends: List[ConversionTrend]
    trust_trends: List[TrustTrend]
    risk_opportunity_matrix: List[RiskOpportunitySegment]
    top_keywords: List[TopKeyword]
    top_pain_points: List[TopPainPoint]
    next_actions: List[NextActionDistribution]


class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    analytics: DashboardAnalytics
    priority_leads: List[PriorityLead]
    recent_activity: List[RecentActivity]
