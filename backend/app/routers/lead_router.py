from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.lead import LeadOut, LeadCreate, LeadUpdate
from app.schemas.lead_detail import LeadDetailResponse
from app.crud import lead_crud

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
    lead = await lead_crud.get_lead_with_details(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

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
