"""
Bulk Lead Analysis & Scoring Script

This script processes all leads in the database:
1. Analyzes call transcriptions using Gemini AI
2. Calculates and saves lead scores

Usage:
    python analyze_all_leads.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import AsyncSessionLocal
from app.models.lead import Lead
from app.models.call_log import CallLog
from app.models.unstructured_analysis import UnstructuredAnalysis
from app.models.lead_score import LeadScore
from app.services.transcription_analyzer_langchain import analyze_transcription_gemini
from app.services.lead_scorer import calculate_lead_score
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def analyze_call(call_id: int, transcription: str, db: AsyncSession) -> bool:
    """
    Analyze a single call transcription using Gemini AI.
    
    Args:
        call_id: The ID of the call to analyze
        transcription: The call transcription text
        db: Database session
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Check if already analyzed
        result = await db.execute(
            select(UnstructuredAnalysis).where(UnstructuredAnalysis.call_id == call_id)
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            logger.info(f"  ⏭️  Call {call_id} already analyzed, skipping...")
            return True
        
        # Analyze with Gemini
        logger.info(f"  🤖 Analyzing call {call_id} with Gemini AI...")
        await analyze_transcription_gemini(call_id, transcription, db)
        logger.info(f"  ✅ Call {call_id} analysis completed")
        return True
        
    except Exception as e:
        logger.error(f"  ❌ Error analyzing call {call_id}: {str(e)}")
        return False


async def score_lead(lead_id: int, db: AsyncSession) -> bool:
    """
    Calculate and save the lead score.
    
    Args:
        lead_id: The ID of the lead to score
        db: Database session
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Check if already scored
        result = await db.execute(
            select(LeadScore)
            .where(LeadScore.lead_id == lead_id)
            .order_by(LeadScore.last_updated.desc())
            .limit(1)
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            logger.info(f"  ⏭️  Lead {lead_id} already scored (score: {existing.score:.2f}), skipping...")
            return True
        
        # Calculate score
        logger.info(f"  🧮 Calculating score for lead {lead_id}...")
        score_result = await calculate_lead_score(lead_id, db)
        
        if "error" in score_result:
            logger.warning(f"  ⚠️  Could not score lead {lead_id}: {score_result['error']}")
            return False
        
        # Save score
        new_score = LeadScore(
            lead_id=lead_id,
            officer_id=score_result.get("officer_id"),
            score=score_result.get("score", 0.0),
            reason=score_result.get("reason", "Calculated from structured and unstructured data")
        )
        
        db.add(new_score)
        await db.commit()
        await db.refresh(new_score)
        
        logger.info(f"  ✅ Lead {lead_id} scored: {new_score.score:.2f}")
        return True
        
    except Exception as e:
        logger.error(f"  ❌ Error scoring lead {lead_id}: {str(e)}")
        await db.rollback()
        return False


async def process_all_leads():
    """
    Main function to process all leads in the database.
    """
    logger.info("=" * 70)
    logger.info("🚀 STARTING BULK LEAD ANALYSIS & SCORING")
    logger.info("=" * 70)
    
    async with AsyncSessionLocal() as db:
        try:
            # Get total counts
            total_leads_result = await db.execute(select(func.count(Lead.id)))
            total_leads = total_leads_result.scalar() or 0
            
            total_calls_result = await db.execute(
                select(func.count(CallLog.id))
                .where(CallLog.transcription.isnot(None))
            )
            total_calls = total_calls_result.scalar() or 0
            
            logger.info(f"\n📊 Database Statistics:")
            logger.info(f"  • Total Leads: {total_leads}")
            logger.info(f"  • Total Calls with Transcriptions: {total_calls}")
            logger.info("")
            
            # Get all leads with their calls
            result = await db.execute(
                select(Lead)
                .order_by(Lead.id)
            )
            leads = result.scalars().all()
            
            if not leads:
                logger.warning("⚠️  No leads found in database")
                return
            
            # Process each lead
            analyzed_count = 0
            scored_count = 0
            skipped_count = 0
            
            for idx, lead in enumerate(leads, 1):
                logger.info(f"\n{'=' * 70}")
                logger.info(f"📍 Processing Lead {idx}/{total_leads}: {lead.name} (ID: {lead.id})")
                logger.info(f"{'=' * 70}")
                
                # Get calls for this lead
                calls_result = await db.execute(
                    select(CallLog)
                    .where(CallLog.lead_id == lead.id)
                    .where(CallLog.transcription.isnot(None))
                    .order_by(CallLog.id)
                )
                calls = calls_result.scalars().all()
                
                if not calls:
                    logger.info(f"  ℹ️  No calls with transcriptions found for lead {lead.id}")
                    skipped_count += 1
                    continue
                
                logger.info(f"  📞 Found {len(calls)} call(s) to analyze")
                
                # Analyze each call
                call_success = 0
                for call in calls:
                    if await analyze_call(call.id, call.transcription, db):
                        call_success += 1
                
                if call_success > 0:
                    analyzed_count += call_success
                    
                    # Score the lead after analyzing calls
                    if await score_lead(lead.id, db):
                        scored_count += 1
                else:
                    logger.warning(f"  ⚠️  No calls successfully analyzed for lead {lead.id}")
                    skipped_count += 1
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)
            
            # Final summary
            logger.info("\n" + "=" * 70)
            logger.info("📊 FINAL SUMMARY")
            logger.info("=" * 70)
            logger.info(f"  ✅ Total Calls Analyzed: {analyzed_count}")
            logger.info(f"  ✅ Total Leads Scored: {scored_count}")
            logger.info(f"  ⏭️  Leads Skipped (no calls): {skipped_count}")
            logger.info(f"  📈 Success Rate: {(scored_count/total_leads*100):.1f}%")
            logger.info("=" * 70)
            logger.info("🎉 BULK PROCESSING COMPLETED!")
            logger.info("=" * 70)
            
        except Exception as e:
            logger.error(f"\n💥 Fatal error during processing: {str(e)}")
            raise
        finally:
            await db.close()


if __name__ == "__main__":
    try:
        asyncio.run(process_all_leads())
    except KeyboardInterrupt:
        logger.info("\n\n⚠️  Process interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"\n💥 Script failed: {str(e)}")
        sys.exit(1)
