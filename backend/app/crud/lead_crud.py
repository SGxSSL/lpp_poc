from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from app.models.lead import Lead
from app.models.call_log import CallLog
from app.models.officer import Officer
from app.schemas.lead import LeadCreate, LeadUpdate

async def get_all_leads(db: AsyncSession):
    result = await db.execute(select(Lead))
    return result.scalars().all()

async def get_lead_with_details(db: AsyncSession, lead_id: int):
    # Query lead with related call logs, officer details, and unstructured analysis
    query = (
        select(Lead)
        .options(
            selectinload(Lead.call_logs),
            selectinload(Lead.call_logs).joinedload(CallLog.officer),
            selectinload(Lead.call_logs).selectinload(CallLog.unstructured_analyses)
        )
        .where(Lead.id == lead_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_lead(db: AsyncSession, lead_id: int):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    return result.scalar_one_or_none()

async def create_lead(db: AsyncSession, lead_data: LeadCreate):
    new_lead = Lead(**lead_data.dict())
    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead)
    return new_lead

async def update_lead(db: AsyncSession, lead_id: int, lead_data: LeadUpdate):
    lead = await get_lead(db, lead_id)
    if not lead:
        return None
    for field, value in lead_data.dict(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.commit()
    await db.refresh(lead)
    return lead

async def delete_lead(db: AsyncSession, lead_id: int):
    lead = await get_lead(db, lead_id)
    if not lead:
        return None
    await db.delete(lead)
    await db.commit()
    return lead
