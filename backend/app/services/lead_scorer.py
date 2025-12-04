from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lead import Lead
from app.models.call_log import CallLog
from app.models.unstructured_analysis import UnstructuredAnalysis
from app.models.lead_score import LeadScore
from datetime import datetime

async def calculate_lead_score(lead_id: int, db: AsyncSession):
    """
    Combines structured (Lead, CallLog) + unstructured (Gemini Analysis)
    data to compute a final conversion score between 0–100.
    """

    print(f"\n[DEBUG] 🧮 Starting lead score calculation for lead_id={lead_id}")

    # Fetch latest call
    call_query = await db.execute(
        select(CallLog).where(CallLog.lead_id == lead_id).order_by(CallLog.call_date.desc())
    )
    call = call_query.scalars().first()
    if not call:
        print(f"[DEBUG] ❌ No calls found for lead_id={lead_id}")
        return {"error": "No calls found for this lead."}
    print(f"[DEBUG] ✅ Found latest call_id={call.id} (duration={call.duration_minutes} mins)")

    # Fetch unstructured analysis
    analysis_query = await db.execute(
        select(UnstructuredAnalysis).where(UnstructuredAnalysis.call_id == call.id)
    )
    analysis = analysis_query.scalars().first()
    if not analysis:
        print(f"[DEBUG] ❌ No unstructured analysis found for call_id={call.id}")
        return {"error": "Missing analysis data."}

    lead = await db.get(Lead, lead_id)
    if not lead:
        print(f"[DEBUG] ❌ No lead found for ID={lead_id}")
        return {"error": "Lead not found."}

    print(f"[DEBUG] 🎯 Found Lead: {lead.name}, Credit Score={lead.credit_score}, Status={lead.status}")

    # -----------------------------
    # 1️⃣ Structured data weights
    # -----------------------------
    credit_score_factor = (lead.credit_score or 0) / 850 * 10
    interest_factor = (lead.interest_level or 0)  # Already 0-10 scale
    duration_factor = 5 if (call.duration_minutes or 0) > 10 else 2
    status_bonus = 5 if lead.status and lead.status.lower() in ["qualified", "active"] else 0

    print(f"[DEBUG] 📊 Structured weights: credit={credit_score_factor}, interest={interest_factor}, "
          f"duration={duration_factor}, status_bonus={status_bonus}")

    # -----------------------------
    # 2️⃣ Unstructured data weights
    # -----------------------------
    sentiment_map = {"positive": 10, "neutral": 5, "negative": -5}
    sentiment_factor = sentiment_map.get((analysis.sentiment or "").lower(), 0)
    clarity_factor = (analysis.clarity_score or 0)
    empathy_factor = (analysis.empathy_score or 0)
    cooperation_factor = (analysis.cooperation_index or 0) * 10
    conversion_prob = (analysis.conversion_probability or 0) * 0.4

    intent_strength = {
        "high": 15,
        "medium": 7,
        "low": 0
    }.get((analysis.intent_strength or "").lower(), 0)

    print(f"[DEBUG] 💬 Unstructured factors: sentiment={sentiment_factor}, clarity={clarity_factor}, "
          f"empathy={empathy_factor}, cooperation={cooperation_factor}, "
          f"conversion_prob={conversion_prob}, intent_strength={intent_strength}")

    # -----------------------------
    # 3️⃣ Final Score Computation
    # -----------------------------
    score = (
        credit_score_factor +
        interest_factor +
        duration_factor +
        status_bonus +
        sentiment_factor +
        clarity_factor +
        empathy_factor +
        cooperation_factor +
        conversion_prob +
        intent_strength
    )

    score = max(0, min(100, round(score, 2)))
    print(f"[DEBUG] 🧾 Final Computed Score: {score}")

    # -----------------------------
    # 4️⃣ Save / Update DB
    # -----------------------------
    existing_score_query = await db.execute(
        select(LeadScore).where(LeadScore.lead_id == lead_id)
    )
    existing_score = existing_score_query.scalars().first()

    reason = (
        f"Calculated from intent={analysis.intent_strength}, "
        f"sentiment={analysis.sentiment}, clarity={analysis.clarity_score}, "
        f"credit={lead.credit_score}, cooperation={analysis.cooperation_index}"
    )

    if existing_score:
        print(f"[DEBUG] 🔁 Updating existing score record (id={existing_score.id})")
        existing_score.score = score
        existing_score.reason = reason
        existing_score.last_updated = datetime.utcnow()
    else:
        print(f"[DEBUG] 🆕 Creating new LeadScore entry for lead_id={lead_id}")
        new_score = LeadScore(
            lead_id=lead_id,
            officer_id=call.officer_id,
            score=score,
            reason=reason,
        )
        db.add(new_score)

    await db.commit()
    print(f"[DEBUG] ✅ Lead score successfully saved for lead_id={lead_id}")

    return {
        "lead_id": lead_id,
        "call_id": call.id,
        "officer_id": call.officer_id,
        "score": score,
        "reason": reason
    }
