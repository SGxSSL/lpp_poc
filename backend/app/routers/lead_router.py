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
    Smart lead details endpoint that auto-analyzes and scores if needed.
    
    Flow:
    1. Fetch lead with call logs
    2. Check if calls need AI analysis
    3. If unanalyzed calls exist → Analyze them automatically
    4. Check if lead needs scoring
    5. If unscored → Calculate and save score
    6. Return complete lead details
    """
    logger.info(f"📊 Fetching details for lead_id={lead_id}")
    
    # Step 1: Get lead with all relationships
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Step 2: Check if lead has calls
    if not lead.call_logs or len(lead.call_logs) == 0:
        logger.info(f"ℹ️ Lead {lead_id} has no calls yet")
        return lead
    
    # Step 3: Auto-analyze unanalyzed calls
    calls_to_analyze = []
    for call in lead.call_logs:
        if call.transcription and (not call.unstructured_analyses or len(call.unstructured_analyses) == 0):
            calls_to_analyze.append(call)
    
    if calls_to_analyze:
        logger.info(f"🤖 Auto-analyzing {len(calls_to_analyze)} unanalyzed calls for lead {lead_id}")
        
        for call in calls_to_analyze:
            try:
                logger.info(f"  → Analyzing call {call.id}")
                await analyze_transcription_gemini(call.id, call.transcription, db)
                logger.info(f"  ✅ Call {call.id} analyzed successfully")
            except Exception as e:
                logger.error(f"  ❌ Failed to analyze call {call.id}: {str(e)}")
                # Continue with other calls even if one fails
        
        # Refresh lead data to include new analyses
        await db.refresh(lead)
        lead = await lead_crud.get_lead_with_details(db, lead_id)
    else:
        logger.info(f"✅ All calls for lead {lead_id} are already analyzed")
    
    # Step 4: Auto-score if not scored
    # Check if lead has a recent score
    score_result = await db.execute(
        select(LeadScore)
        .where(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.last_updated.desc())
        .limit(1)
    )
    existing_score = score_result.scalar_one_or_none()
    
    if not existing_score:
        logger.info(f"📈 Auto-scoring lead {lead_id}")
        try:
            score_data = await calculate_lead_score(lead_id, db)
            
            if "error" not in score_data:
                new_score = LeadScore(
                    lead_id=lead_id,
                    officer_id=score_data.get("officer_id", None),
                    score=score_data.get("score", 0.0),
                    reason=score_data.get("reason", "Auto-calculated from structured and unstructured data")
                )
                db.add(new_score)
                await db.commit()
                logger.info(f"✅ Lead {lead_id} scored: {new_score.score}")
            else:
                logger.warning(f"⚠️ Scoring returned error: {score_data['error']}")
        except Exception as e:
            logger.error(f"❌ Failed to score lead {lead_id}: {str(e)}")
            # Continue anyway - scoring is optional
    else:
        logger.info(f"✅ Lead {lead_id} already has a score: {existing_score.score}")
    
    # Step 5: Return complete lead details
    return lead


@router.get("/{lead_id}/details-with-status")
async def get_lead_details_with_status(lead_id: int, db: AsyncSession = Depends(get_db)):
    """
    Enhanced endpoint that returns lead details along with processing status.
    Shows what actions were automatically performed.
    """
    logger.info(f"📊 Fetching details with status for lead_id={lead_id}")
    
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
        "actions_taken": []
    }
    
    # Step 1: Get lead with all relationships
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Step 2: Check if lead has calls
    if not lead.call_logs or len(lead.call_logs) == 0:
        logger.info(f"ℹ️ Lead {lead_id} has no calls yet")
        status["actions_taken"].append("No calls found - nothing to analyze")
        return {
            "lead": lead,
            "status": status
        }
    
    status["has_calls"] = True
    status["total_calls"] = len(lead.call_logs)
    
    # Count already analyzed calls
    already_analyzed = sum(1 for call in lead.call_logs if call.unstructured_analyses and len(call.unstructured_analyses) > 0)
    status["analyzed_calls"] = already_analyzed
    
    # Step 3: Auto-analyze unanalyzed calls
    calls_to_analyze = []
    for call in lead.call_logs:
        if call.transcription and (not call.unstructured_analyses or len(call.unstructured_analyses) == 0):
            calls_to_analyze.append(call)
    
    if calls_to_analyze:
        logger.info(f"🤖 Auto-analyzing {len(calls_to_analyze)} unanalyzed calls for lead {lead_id}")
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
        
        status["analyzed_calls"] = already_analyzed + status["newly_analyzed"]
        status["actions_taken"].append(f"Successfully analyzed {status['newly_analyzed']} new calls")
        
        # Refresh lead data to include new analyses
        await db.refresh(lead)
        lead = await lead_crud.get_lead_with_details(db, lead_id)
    else:
        logger.info(f"✅ All calls for lead {lead_id} are already analyzed")
        status["actions_taken"].append("All calls already analyzed - skipped analysis")
    
    # Step 4: Auto-score if not scored
    score_result = await db.execute(
        select(LeadScore)
        .where(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.created_at.desc())
        .limit(1)
    )
    existing_score = score_result.scalar_one_or_none()
    
    if existing_score:
        status["has_score"] = True
        status["score_value"] = existing_score.score
        status["actions_taken"].append(f"Lead already scored: {existing_score.score}")
    else:
        logger.info(f"📈 Auto-scoring lead {lead_id}")
        try:
            score_data = await calculate_lead_score(lead_id, db)
            
            if "error" not in score_data:
                new_score = LeadScore(
                    lead_id=lead_id,
                    officer_id=score_data.get("officer_id", None),
                    score=score_data.get("score", 0.0),
                    reason=score_data.get("reason", "Auto-calculated from structured and unstructured data")
                )
                db.add(new_score)
                await db.commit()
                logger.info(f"✅ Lead {lead_id} scored: {new_score.score}")
                status["has_score"] = True
                status["score_value"] = new_score.score
                status["newly_scored"] = True
                status["actions_taken"].append(f"Calculated new lead score: {new_score.score}")
            else:
                logger.warning(f"⚠️ Scoring returned error: {score_data['error']}")
                status["actions_taken"].append(f"Scoring failed: {score_data['error']}")
        except Exception as e:
            logger.error(f"❌ Failed to score lead {lead_id}: {str(e)}")
            status["actions_taken"].append(f"Scoring error: {str(e)}")
    
    # Step 5: Return complete data with status
    return {
        "lead": lead,
        "status": status
    }

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
