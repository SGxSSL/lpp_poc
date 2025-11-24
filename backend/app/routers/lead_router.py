from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.schemas.lead import LeadOut, LeadCreate, LeadUpdate
from app.schemas.lead_detail import LeadDetailResponse
from app.crud import lead_crud
from app.models.unstructured_analysis import UnstructuredAnalysis
from app.models.lead_score import LeadScore
from app.services.transcription_analyzer_langchain import analyze_transcription_gemini
from app.services.lead_scorer import calculate_lead_score
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("/", response_model=list[LeadOut])
async def get_leads(db: AsyncSession = Depends(get_db)):
    return await lead_crud.get_all_leads(db)

@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    lead = await lead_crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.get("/{lead_id}/details", response_model=LeadDetailResponse)
async def get_lead_details(lead_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get lead details with all relationships.
    No automatic analysis - use POST /leads/{lead_id}/analyze to trigger analysis.
    """
    logger.info(f"📊 Fetching details for lead_id={lead_id}")
    
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    return lead


@router.post("/{lead_id}/analyze")
async def analyze_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    """
    Manually trigger analysis and scoring for a lead.
    Analyzes all unanalyzed calls and calculates/updates lead score.
    """
    logger.info(f"🤖 Manual analysis triggered for lead_id={lead_id}")
    
    status = {
        "lead_id": lead_id,
        "has_calls": False,
        "total_calls": 0,
        "analyzed_calls": 0,
        "newly_analyzed": 0,
        "analysis_errors": [],
        "has_score": False,
        "score_value": None,
        "newly_scored": False,
        "actions_taken": [],
        "success": True
    }
    
    # Get lead with all relationships
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Check if lead has calls
    if not lead.call_logs or len(lead.call_logs) == 0:
        logger.info(f"ℹ️ Lead {lead_id} has no calls yet")
        status["actions_taken"].append("No calls found - nothing to analyze")
        status["success"] = False
        return status
    
    status["has_calls"] = True
    status["total_calls"] = len(lead.call_logs)
    
    # Count already analyzed calls
    already_analyzed = sum(1 for call in lead.call_logs if call.unstructured_analyses and len(call.unstructured_analyses) > 0)
    status["analyzed_calls"] = already_analyzed
    
    # Analyze unanalyzed calls
    calls_to_analyze = []
    for call in lead.call_logs:
        if call.transcription and (not call.unstructured_analyses or len(call.unstructured_analyses) == 0):
            calls_to_analyze.append(call)
    
    if calls_to_analyze:
        logger.info(f"🤖 Analyzing {len(calls_to_analyze)} unanalyzed calls for lead {lead_id}")
        status["actions_taken"].append(f"Started analyzing {len(calls_to_analyze)} calls")
        
        for call in calls_to_analyze:
            try:
                logger.info(f"  → Analyzing call {call.id}")
                await analyze_transcription_gemini(call.id, call.transcription, db)
                logger.info(f"  ✅ Call {call.id} analyzed successfully")
                status["newly_analyzed"] += 1
            except Exception as e:
                error_msg = f"Call {call.id} failed: {str(e)}"
                logger.error(f"  ❌ {error_msg}")
                status["analysis_errors"].append(error_msg)
                status["success"] = False
        
        status["analyzed_calls"] = already_analyzed + status["newly_analyzed"]
        status["actions_taken"].append(f"Successfully analyzed {status['newly_analyzed']} new calls")
    else:
        logger.info(f"✅ All calls for lead {lead_id} are already analyzed")
        status["actions_taken"].append("All calls already analyzed - skipped analysis")
    
    # Calculate/update score
    score_result = await db.execute(
        select(LeadScore)
        .where(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.last_updated.desc())
        .limit(1)
    )
    existing_score = score_result.scalar_one_or_none()
    
    logger.info(f"📈 Calculating/updating score for lead {lead_id}")
    try:
        score_data = await calculate_lead_score(lead_id, db)
        
        if "error" not in score_data:
            new_score = LeadScore(
                lead_id=lead_id,
                officer_id=score_data.get("officer_id", None),
                score=score_data.get("score", 0.0),
                reason=score_data.get("reason", "Calculated from structured and unstructured data")
            )
            db.add(new_score)
            await db.commit()
            logger.info(f"✅ Lead {lead_id} scored: {new_score.score}")
            status["has_score"] = True
            status["score_value"] = new_score.score
            status["newly_scored"] = True
            if existing_score:
                status["actions_taken"].append(f"Updated lead score from {existing_score.score} to {new_score.score}")
            else:
                status["actions_taken"].append(f"Calculated new lead score: {new_score.score}")
        else:
            logger.warning(f"⚠️ Scoring returned error: {score_data['error']}")
            status["actions_taken"].append(f"Scoring failed: {score_data['error']}")
            status["success"] = False
    except Exception as e:
        logger.error(f"❌ Failed to score lead {lead_id}: {str(e)}")
        status["actions_taken"].append(f"Scoring error: {str(e)}")
        status["success"] = False
    
    return status

@router.post("/", response_model=LeadOut)
async def create_lead(lead_data: LeadCreate, db: AsyncSession = Depends(get_db)):
    return await lead_crud.create_lead(db, lead_data)

@router.put("/{lead_id}", response_model=LeadOut)
async def update_lead(lead_id: int, lead_data: LeadUpdate, db: AsyncSession = Depends(get_db)):
    updated = await lead_crud.update_lead(db, lead_id, lead_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated

@router.delete("/{lead_id}")
async def delete_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await lead_crud.delete_lead(db, lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}
