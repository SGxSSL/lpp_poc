import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.lead_score import LeadScore

async def cleanup_duplicates():
    async with AsyncSessionLocal() as db:
        # Get all scores for lead 51
        result = await db.execute(
            select(LeadScore)
            .where(LeadScore.lead_id == 51)
            .order_by(LeadScore.id)
        )
        scores = result.scalars().all()
        
        print(f'\n📊 Found {len(scores)} score records for lead 51:')
        for s in scores:
            print(f'  ID={s.id}, Version={s.version}, Score={s.score}, '
                  f'Calls={s.total_calls_analyzed}, Created={s.created_at}')
        
        # Keep only the most recent one, delete older duplicates
        if len(scores) > 1:
            to_delete = scores[:-1]  # All except the last one
            for s in to_delete:
                print(f'\n🗑️ Deleting duplicate: ID={s.id}, Version={s.version}')
                await db.delete(s)
            
            await db.commit()
            print('\n✅ Cleanup complete! Kept only the most recent score.')
        else:
            print('\n✅ No duplicates found.')

if __name__ == "__main__":
    asyncio.run(cleanup_duplicates())
