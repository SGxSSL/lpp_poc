# app/api/routes/analysis.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.call_log import CallLog
from app.models.lead_score import LeadScore
from app.models.lead import Lead
from app.services.transcription_analyzer_langchain import analyze_transcription_gemini
from app.services.lead_scorer import calculate_lead_score

router = APIRouter(prefix="/analysis", tags=["Analysis"])

# ---------------------------------------------------------
# 🔹 1. Analyze Transcription with Gemini
# ---------------------------------------------------------
@router.post("/gemini/{call_id}")
async def analyze_with_gemini(call_id: int, db: AsyncSession = Depends(get_db)):
    """
    Uses Gemini 2.5 Flash to analyze a call transcription
    and store unstructured data insights into the DB.
    """
    call = await db.get(CallLog, call_id)
    if not call or not call.transcription:
        raise HTTPException(status_code=404, detail="Call or transcription not found")

    result = await analyze_transcription_gemini(call_id, call.transcription, db)
    return {"message": "Gemini analysis completed ✅", "data": result}


# ---------------------------------------------------------
# 🔹 2. Calculate Final Lead Score (Structured + Unstructured)
# ---------------------------------------------------------
@router.post("/score/{lead_id}")
async def calculate_score(lead_id: int, db: AsyncSession = Depends(get_db)):
    """
    Combines structured (lead + call logs) and unstructured (Gemini analysis)
    data to compute a lead score and save it into the database.
    """
    print(f"\n[DEBUG] 🚀 Starting /score endpoint for lead_id={lead_id}")

    # Step 1: Validate lead
    lead = await db.get(Lead, lead_id)
    if not lead:
        print(f"[DEBUG] ❌ Lead not found: lead_id={lead_id}")
        raise HTTPException(status_code=404, detail="Lead not found")
    print(f"[DEBUG] ✅ Lead found: {lead.name}, credit_score={lead.credit_score}, status={lead.status}")

    # Step 2: Compute score via logic
    try:
        result = await calculate_lead_score(lead_id, db)
    except Exception as e:
        print(f"[DEBUG] 💥 Exception while calculating lead score: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if "error" in result:
        print(f"[DEBUG] ⚠️ Lead score calculation returned error: {result['error']}")
        raise HTTPException(status_code=404, detail=result["error"])

    print(f"[DEBUG] 🧮 Lead score calculation result: {result}")

    # Step 3: Save or update LeadScore entry
    new_score = LeadScore(
        lead_id=lead_id,
        officer_id=result.get("officer_id", None),
        score=result.get("score", 0.0),
        reason=result.get("reason", "Calculated from structured and unstructured data")
    )

    db.add(new_score)
    await db.commit()
    await db.refresh(new_score)
    print(f"[DEBUG] ✅ LeadScore saved successfully! ID={new_score.id}, Score={new_score.score}")

    # Step 4: Return response
    response = {
        "message": "✅ Lead score calculated and saved successfully",
        "data": {
            "lead_id": lead_id,
            "score": new_score.score,
            "reason": new_score.reason,
            "lead_score_id": new_score.id
        }
    }

    print(f"[DEBUG] 📤 Response: {response}")
    return response

from sqlalchemy.future import select

from app.models.unstructured_analysis import UnstructuredAnalysis



@router.get("/unstructured/{call_id}")
async def get_unstructured_analysis(call_id: int, db: AsyncSession = Depends(get_db)):
    """
    Fetch the full unstructured AI analysis (Gemini output)
    for a given call_id from the database.
    """
    # ✅ Check if call exists
    call = await db.get(CallLog, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # ✅ Get associated unstructured analysis
    result = await db.execute(
        select(UnstructuredAnalysis).where(UnstructuredAnalysis.call_id == call_id)
    )
    analysis = result.scalars().first()

    if not analysis:
        raise HTTPException(status_code=404, detail="No unstructured analysis found for this call")

    return {
        "message": "✅ Unstructured analysis fetched successfully",
        "data": {
            "call_id": analysis.call_id,
            "model_name": analysis.model_name,
            "sentiment": analysis.sentiment,
            "tone": analysis.tone,
            "intent_type": analysis.intent_type,
            "intent_strength": analysis.intent_strength,
            "decision_stage": analysis.decision_stage,
            "conversion_probability": analysis.conversion_probability,
            "keywords": analysis.keywords,
            "topics_discussed": analysis.topics_discussed,
            "entity_mentions": analysis.entity_mentions,
            "speech_acts": analysis.speech_acts,
            "discourse_relations": analysis.discourse_relations,
            "framing_style": analysis.framing_style,
            "deception_markers": analysis.deception_markers,
            "pain_points": analysis.pain_points,
            "objections": analysis.objections,
            "clarity_score": analysis.clarity_score,
            "trust_score": analysis.trust_score,
            "emotion_profile": analysis.emotion_profile,
            "dominant_emotion": analysis.dominant_emotion,
            "empathy_score": analysis.empathy_score,
            "politeness_level": analysis.politeness_level,
            "formality_level": analysis.formality_level,
            "next_actions": analysis.next_actions,
            "followup_priority": analysis.followup_priority,
            "conversation_phases": analysis.conversation_phases,
            "cooperation_index": analysis.cooperation_index,
            "dominance_score": analysis.dominance_score,
            "talk_ratio": analysis.talk_ratio,
            "interruptions": analysis.interruptions,
            "response_latency": analysis.response_latency,
            "summary_ai": analysis.summary_ai,
            "outcome_classification": analysis.outcome_classification,
            "highlights": analysis.highlights,
            "themes": analysis.themes,
            "confidence": analysis.confidence,
            "created_at": analysis.created_at,
        },
    }


@router.get("/debug/lead/{lead_id}")
async def debug_lead_details(lead_id: int, db: AsyncSession = Depends(get_db)):
    """
    🔍 DEBUG ENDPOINT: Check if lead details with unstructured analysis is working
    """
    from app.crud import lead_crud
    from app.schemas.lead_detail import LeadDetailResponse
    
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Check data presence
    debug_info = {
        "lead_id": lead.id,
        "lead_name": lead.name,
        "call_logs_count": len(lead.call_logs) if lead.call_logs else 0,
        "call_logs_details": []
    }
    
    if lead.call_logs:
        for call in lead.call_logs:
            call_info = {
                "call_id": call.id,
                "call_date": call.call_date,
                "unstructured_analyses_count": len(call.unstructured_analyses) if call.unstructured_analyses else 0,
                "officer": call.officer.name if call.officer else "No officer"
            }
            
            if call.unstructured_analyses:
                call_info["unstructured_analyses_sample"] = [
                    {
                        "id": ua.id,
                        "sentiment": ua.sentiment,
                        "tone": ua.tone,
                        "created_at": str(ua.created_at)
                    }
                    for ua in call.unstructured_analyses[:1]
                ]
            
            debug_info["call_logs_details"].append(call_info)
    
    return {
        "message": "🔍 Debug info for lead details",
        "debug": debug_info,
        "schema_validation": "Attempting to convert to LeadDetailResponse...",
        "full_data": {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "credit_score": lead.credit_score,
            "interest_level": lead.interest_level,
            "last_contact_date": lead.last_contact_date,
            "source": lead.source,
            "status": lead.status,
            "lead_type": lead.lead_type,
            "created_at": lead.created_at,
            "call_logs": [
                {
                    "id": call.id,
                    "lead_id": call.lead_id,
                    "officer_id": call.officer_id,
                    "call_date": call.call_date,
                    "duration_minutes": call.duration_minutes,
                    "outcome": call.outcome,
                    "channel": call.channel,
                    "transcription": call.transcription[:100] + "..." if call.transcription else None,
                    "summary": call.summary,
                    "intent": call.intent,
                    "objections": call.objections,
                    "sentiment": call.sentiment,
                    "created_at": call.created_at,
                    "officer": {
                        "id": call.officer.id,
                        "name": call.officer.name,
                        "region": call.officer.region,
                        "specialty": call.officer.specialty,
                        "experience_years": call.officer.experience_years,
                        "created_at": call.officer.created_at
                    } if call.officer else None,
                    "unstructured_analyses": [
                        {
                            "id": ua.id,
                            "call_id": ua.call_id,
                            "sentiment": ua.sentiment,
                            "tone": ua.tone,
                            "intent_type": ua.intent_type,
                            "keywords": ua.keywords,
                            "pain_points": ua.pain_points,
                            "created_at": ua.created_at
                        }
                        for ua in call.unstructured_analyses
                    ] if call.unstructured_analyses else []
                }
                for call in lead.call_logs
            ] if lead.call_logs else []
        }
    }
