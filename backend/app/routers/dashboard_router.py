from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.core.database import get_db
from app.schemas.dashboard import (
    DashboardResponse, DashboardMetrics, DashboardAnalytics,
    StatusDistribution, TypeDistribution, InterestDistribution,
    CreditScoreDistribution, SentimentDistribution, PriorityLead, RecentActivity,
    DecisionStageDistribution, IntentStrengthDistribution, EmotionDistribution,
    FollowUpPriorityDistribution, ConversionTrend, TrustTrend, RiskOpportunitySegment,
    TopKeyword, TopPainPoint, NextActionDistribution
)
from app.models.lead import Lead
from app.models.call_log import CallLog
from app.models.unstructured_analysis import UnstructuredAnalysis
from app.models.lead_score import LeadScore
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(db: AsyncSession = Depends(get_db)):
    """
    Comprehensive dashboard endpoint that returns all analytics and metrics.
    """
    logger.info("📊 Fetching dashboard data")
    
    # === METRICS ===
    # Total leads
    total_leads_result = await db.execute(select(func.count(Lead.id)))
    total_leads = total_leads_result.scalar() or 0
    
    # Active leads
    active_leads_result = await db.execute(
        select(func.count(Lead.id)).where(Lead.status == "Active")
    )
    active_leads = active_leads_result.scalar() or 0
    
    # Hot leads (interest >= 8)
    hot_leads_result = await db.execute(
        select(func.count(Lead.id)).where(Lead.interest_level >= 8)
    )
    hot_leads = hot_leads_result.scalar() or 0
    
    # Average credit score
    avg_credit_result = await db.execute(
        select(func.avg(Lead.credit_score)).where(Lead.credit_score.isnot(None))
    )
    avg_credit_score = avg_credit_result.scalar() or 0.0
    
    # Total calls
    total_calls_result = await db.execute(select(func.count(CallLog.id)))
    total_calls = total_calls_result.scalar() or 0
    
    # Analyzed calls
    analyzed_calls_result = await db.execute(
        select(func.count(func.distinct(UnstructuredAnalysis.call_id)))
    )
    analyzed_calls = analyzed_calls_result.scalar() or 0
    
    # Average conversion probability
    avg_conversion_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.conversion_probability))
        .where(UnstructuredAnalysis.conversion_probability.isnot(None))
    )
    avg_conversion = avg_conversion_result.scalar()
    
    # Average trust score
    avg_trust_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.trust_score))
        .where(UnstructuredAnalysis.trust_score.isnot(None))
    )
    avg_trust = avg_trust_result.scalar()
    
    # Average clarity score
    avg_clarity_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.clarity_score))
        .where(UnstructuredAnalysis.clarity_score.isnot(None))
    )
    avg_clarity = avg_clarity_result.scalar()
    
    # Average empathy score
    avg_empathy_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.empathy_score))
        .where(UnstructuredAnalysis.empathy_score.isnot(None))
    )
    avg_empathy = avg_empathy_result.scalar()
    
    # Average cooperation index
    avg_coop_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.cooperation_index))
        .where(UnstructuredAnalysis.cooperation_index.isnot(None))
    )
    avg_cooperation = avg_coop_result.scalar()
    
    # Average interruptions
    avg_interruptions_result = await db.execute(
        select(func.avg(UnstructuredAnalysis.interruptions))
        .where(UnstructuredAnalysis.interruptions.isnot(None))
    )
    avg_interruptions = avg_interruptions_result.scalar()
    
    metrics = DashboardMetrics(
        total_leads=total_leads,
        active_leads=active_leads,
        hot_leads=hot_leads,
        avg_credit_score=round(avg_credit_score, 2),
        total_calls=total_calls,
        analyzed_calls=analyzed_calls,
        avg_conversion_probability=round(avg_conversion, 2) if avg_conversion else None,
        avg_trust_score=round(avg_trust, 2) if avg_trust else None,
        avg_clarity_score=round(avg_clarity, 2) if avg_clarity else None,
        avg_empathy_score=round(avg_empathy, 2) if avg_empathy else None,
        avg_cooperation_index=round(avg_cooperation, 2) if avg_cooperation else None,
        avg_interruptions=round(avg_interruptions, 2) if avg_interruptions else None
    )
    
    # === ANALYTICS ===
    # Status distribution
    status_dist_result = await db.execute(
        select(Lead.status, func.count(Lead.id).label('count'))
        .group_by(Lead.status)
    )
    status_distribution = [
        StatusDistribution(status=row[0] or "Unknown", count=row[1])
        for row in status_dist_result.all()
    ]
    
    # Type distribution
    type_dist_result = await db.execute(
        select(Lead.lead_type, func.count(Lead.id).label('count'))
        .group_by(Lead.lead_type)
    )
    type_distribution = [
        TypeDistribution(lead_type=row[0] or "Unknown", count=row[1])
        for row in type_dist_result.all()
    ]
    
    # Interest level distribution
    all_leads_result = await db.execute(select(Lead.interest_level))
    all_interest_levels = [row[0] for row in all_leads_result.all() if row[0] is not None]
    
    interest_buckets = {"High (8-10)": 0, "Medium (5-7)": 0, "Low (0-4)": 0}
    for level in all_interest_levels:
        if level >= 8:
            interest_buckets["High (8-10)"] += 1
        elif level >= 5:
            interest_buckets["Medium (5-7)"] += 1
        else:
            interest_buckets["Low (0-4)"] += 1
    
    interest_distribution = [
        InterestDistribution(level=k, count=v) 
        for k, v in interest_buckets.items() if v > 0
    ]
    
    # Credit score distribution
    all_credits_result = await db.execute(select(Lead.credit_score))
    all_credits = [row[0] for row in all_credits_result.all() if row[0] is not None]
    
    credit_buckets = {
        "Excellent (750+)": 0,
        "Good (700-749)": 0,
        "Fair (650-699)": 0,
        "Poor (<650)": 0
    }
    for score in all_credits:
        if score >= 750:
            credit_buckets["Excellent (750+)"] += 1
        elif score >= 700:
            credit_buckets["Good (700-749)"] += 1
        elif score >= 650:
            credit_buckets["Fair (650-699)"] += 1
        else:
            credit_buckets["Poor (<650)"] += 1
    
    credit_distribution = [
        CreditScoreDistribution(bucket=k, count=v)
        for k, v in credit_buckets.items() if v > 0
    ]
    
    # Sentiment distribution
    sentiment_dist_result = await db.execute(
        select(UnstructuredAnalysis.sentiment, func.count(UnstructuredAnalysis.id).label('count'))
        .where(UnstructuredAnalysis.sentiment.isnot(None))
        .group_by(UnstructuredAnalysis.sentiment)
    )
    sentiment_distribution = [
        SentimentDistribution(sentiment=row[0], count=row[1])
        for row in sentiment_dist_result.all()
    ]
    
    # Decision stage distribution with avg conversion probability
    decision_stage_result = await db.execute(
        select(
            UnstructuredAnalysis.decision_stage,
            func.count(UnstructuredAnalysis.id).label('count'),
            func.avg(UnstructuredAnalysis.conversion_probability).label('avg_conv')
        )
        .where(UnstructuredAnalysis.decision_stage.isnot(None))
        .group_by(UnstructuredAnalysis.decision_stage)
    )
    decision_stage_distribution = [
        DecisionStageDistribution(stage=row[0], count=row[1], avg_conversion_prob=round(row[2], 2) if row[2] else None)
        for row in decision_stage_result.all()
    ]
    
    # Intent strength distribution
    intent_strength_result = await db.execute(
        select(UnstructuredAnalysis.intent_strength, func.count(UnstructuredAnalysis.id).label('count'))
        .where(UnstructuredAnalysis.intent_strength.isnot(None))
        .group_by(UnstructuredAnalysis.intent_strength)
    )
    intent_strength_distribution = [
        IntentStrengthDistribution(strength=row[0], count=row[1])
        for row in intent_strength_result.all()
    ]
    
    # Dominant emotion distribution
    emotion_result = await db.execute(
        select(UnstructuredAnalysis.dominant_emotion, func.count(UnstructuredAnalysis.id).label('count'))
        .where(UnstructuredAnalysis.dominant_emotion.isnot(None))
        .group_by(UnstructuredAnalysis.dominant_emotion)
    )
    emotion_distribution = [
        EmotionDistribution(emotion=row[0], count=row[1])
        for row in emotion_result.all()
    ]
    
    # Follow-up priority distribution
    followup_result = await db.execute(
        select(UnstructuredAnalysis.followup_priority, func.count(UnstructuredAnalysis.id).label('count'))
        .where(UnstructuredAnalysis.followup_priority.isnot(None))
        .group_by(UnstructuredAnalysis.followup_priority)
    )
    followup_priority_distribution = [
        FollowUpPriorityDistribution(priority=row[0], count=row[1])
        for row in followup_result.all()
    ]
    
    # Conversion trends (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    conversion_trends_result = await db.execute(
        select(
            func.date(UnstructuredAnalysis.created_at).label('date'),
            func.avg(UnstructuredAnalysis.conversion_probability).label('avg_conv'),
            func.count(UnstructuredAnalysis.id).label('count')
        )
        .where(UnstructuredAnalysis.created_at >= thirty_days_ago)
        .where(UnstructuredAnalysis.conversion_probability.isnot(None))
        .group_by(func.date(UnstructuredAnalysis.created_at))
        .order_by(func.date(UnstructuredAnalysis.created_at))
    )
    conversion_trends = [
        ConversionTrend(date=str(row[0]), avg_conversion=round(row[1], 2), count=row[2])
        for row in conversion_trends_result.all()
    ]
    
    # Trust score trends (last 30 days)
    trust_trends_result = await db.execute(
        select(
            func.date(UnstructuredAnalysis.created_at).label('date'),
            func.avg(UnstructuredAnalysis.trust_score).label('avg_trust'),
            func.count(UnstructuredAnalysis.id).label('count')
        )
        .where(UnstructuredAnalysis.created_at >= thirty_days_ago)
        .where(UnstructuredAnalysis.trust_score.isnot(None))
        .group_by(func.date(UnstructuredAnalysis.created_at))
        .order_by(func.date(UnstructuredAnalysis.created_at))
    )
    trust_trends = [
        TrustTrend(date=str(row[0]), avg_trust=round(row[1], 2), count=row[2])
        for row in trust_trends_result.all()
    ]
    
    # Risk & Opportunity Matrix
    # Get all analyses with conversion and trust scores
    risk_opp_result = await db.execute(
        select(UnstructuredAnalysis.conversion_probability, UnstructuredAnalysis.trust_score)
        .where(UnstructuredAnalysis.conversion_probability.isnot(None))
        .where(UnstructuredAnalysis.trust_score.isnot(None))
    )
    risk_opp_data = risk_opp_result.all()
    
    segments = {
        "hot_prospects": [],  # High conv, high trust
        "risky_opportunities": [],  # High conv, low trust
        "nurture_candidates": [],  # Low conv, high trust
        "deprioritize": []  # Low conv, low trust
    }
    
    for row in risk_opp_data:
        conv = row[0]
        trust = row[1]
        
        if conv >= 0.6 and trust >= 0.6:
            segments["hot_prospects"].append((conv, trust))
        elif conv >= 0.6 and trust < 0.6:
            segments["risky_opportunities"].append((conv, trust))
        elif conv < 0.6 and trust >= 0.6:
            segments["nurture_candidates"].append((conv, trust))
        else:
            segments["deprioritize"].append((conv, trust))
    
    risk_opportunity_matrix = []
    for segment, data in segments.items():
        if data:
            avg_conv = sum(d[0] for d in data) / len(data)
            avg_trust = sum(d[1] for d in data) / len(data)
            risk_opportunity_matrix.append(RiskOpportunitySegment(
                segment=segment,
                count=len(data),
                avg_conversion=round(avg_conv, 2),
                avg_trust=round(avg_trust, 2)
            ))
    
    # Top keywords (extract from JSON keywords field)
    keywords_result = await db.execute(
        select(UnstructuredAnalysis.keywords)
        .where(UnstructuredAnalysis.keywords.isnot(None))
    )
    
    keyword_freq = {}
    for row in keywords_result.all():
        keywords_data = row[0]
        if keywords_data:
            if isinstance(keywords_data, str):
                try:
                    keywords_data = json.loads(keywords_data)
                except:
                    continue
            
            if isinstance(keywords_data, list):
                for kw in keywords_data:
                    if isinstance(kw, str):
                        keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
                    elif isinstance(kw, dict) and 'word' in kw:
                        keyword_freq[kw['word']] = keyword_freq.get(kw['word'], 0) + 1
    
    top_keywords = [
        TopKeyword(keyword=k, frequency=v)
        for k, v in sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    # Top pain points
    pain_points_result = await db.execute(
        select(UnstructuredAnalysis.pain_points)
        .where(UnstructuredAnalysis.pain_points.isnot(None))
        .where(UnstructuredAnalysis.pain_points != '')
    )
    
    pain_point_freq = {}
    for row in pain_points_result.all():
        pain_text = row[0]
        if pain_text:
            # Simple word extraction
            words = pain_text.lower().split()
            for word in words:
                if len(word) > 4:  # Only meaningful words
                    pain_point_freq[word] = pain_point_freq.get(word, 0) + 1
    
    top_pain_points = [
        TopPainPoint(pain_point=k, frequency=v)
        for k, v in sorted(pain_point_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    # Next actions distribution
    next_actions_result = await db.execute(
        select(UnstructuredAnalysis.next_actions)
        .where(UnstructuredAnalysis.next_actions.isnot(None))
        .where(UnstructuredAnalysis.next_actions != '')
    )
    
    action_freq = {}
    for row in next_actions_result.all():
        action_text = row[0]
        if action_text:
            # Extract first sentence/action
            first_action = action_text.split('.')[0].strip()
            if first_action:
                action_freq[first_action] = action_freq.get(first_action, 0) + 1
    
    next_actions = [
        NextActionDistribution(action=k, count=v)
        for k, v in sorted(action_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    analytics = DashboardAnalytics(
        status_distribution=status_distribution,
        type_distribution=type_distribution,
        interest_distribution=interest_distribution,
        credit_distribution=credit_distribution,
        sentiment_distribution=sentiment_distribution,
        decision_stage_distribution=decision_stage_distribution,
        intent_strength_distribution=intent_strength_distribution,
        emotion_distribution=emotion_distribution,
        followup_priority_distribution=followup_priority_distribution,
        conversion_trends=conversion_trends,
        trust_trends=trust_trends,
        risk_opportunity_matrix=risk_opportunity_matrix,
        top_keywords=top_keywords,
        top_pain_points=top_pain_points,
        next_actions=next_actions
    )
    
    # === PRIORITY LEADS ===
    # Get leads sorted by their calculated lead score (from lead_scores table)
    priority_leads_query = (
        select(
            Lead, 
            LeadScore.score,
            UnstructuredAnalysis.conversion_probability, 
            UnstructuredAnalysis.trust_score
        )
        .outerjoin(LeadScore, Lead.id == LeadScore.lead_id)
        .outerjoin(CallLog, Lead.id == CallLog.lead_id)
        .outerjoin(UnstructuredAnalysis, CallLog.id == UnstructuredAnalysis.call_id)
        .where(LeadScore.score.isnot(None))
        .order_by(desc(LeadScore.score))
        .limit(10)
    )
    
    priority_result = await db.execute(priority_leads_query)
    priority_rows = priority_result.all()
    
    priority_leads = []
    seen_lead_ids = set()
    
    for row in priority_rows:
        lead = row[0]
        lead_score = row[1]
        conversion_prob = row[2]
        trust_score = row[3]
        
        if lead.id not in seen_lead_ids:
            priority_leads.append(PriorityLead(
                id=lead.id,
                name=lead.name,
                email=lead.email,
                lead_type=lead.lead_type,
                status=lead.status,
                interest_level=lead.interest_level,
                credit_score=lead.credit_score,
                lead_score=lead_score,
                source=lead.source,
                last_contact_date=lead.last_contact_date,
                created_at=lead.created_at,
                conversion_probability=conversion_prob,
                trust_score=trust_score
            ))
            seen_lead_ids.add(lead.id)
    
    # === RECENT ACTIVITY ===
    # Get recently created leads
    recent_leads_result = await db.execute(
        select(Lead)
        .order_by(desc(Lead.created_at))
        .limit(10)
    )
    recent_leads = recent_leads_result.scalars().all()
    
    recent_activity = [
        RecentActivity(
            id=lead.id,
            name=lead.name,
            email=lead.email,
            lead_type=lead.lead_type,
            status=lead.status,
            created_at=lead.created_at,
            activity_type="new_lead",
            description=f"New {lead.lead_type or 'lead'} added"
        )
        for lead in recent_leads
    ]
    
    logger.info(f"✅ Dashboard data compiled: {total_leads} leads, {analyzed_calls} analyzed calls")
    
    return DashboardResponse(
        metrics=metrics,
        analytics=analytics,
        priority_leads=priority_leads,
        recent_activity=recent_activity
    )
