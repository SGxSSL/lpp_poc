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
