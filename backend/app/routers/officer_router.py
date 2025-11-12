# app/routers/officer_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.crud import officer_crud
from app.schemas.officer import OfficerOut, OfficerCreate, OfficerUpdate

router = APIRouter(
    prefix="/officers",
    tags=["officers"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[OfficerOut])
async def get_officers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all officers with pagination.
    """
    officers = await officer_crud.get_officers(db, skip=skip, limit=limit)
    return officers

@router.get("/{officer_id}", response_model=OfficerOut)
async def get_officer(officer_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific officer by ID.
    """
    db_officer = await officer_crud.get_officer(db, officer_id)
    if db_officer is None:
        raise HTTPException(status_code=404, detail="Officer not found")
    return db_officer

@router.post("/", response_model=OfficerOut)
async def create_officer(officer: OfficerCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new officer.
    """
    db_officer = await officer_crud.get_officer_by_name(db, name=officer.name)
    if db_officer:
        raise HTTPException(status_code=400, detail="Officer with this name already exists")
    return await officer_crud.create_officer(db=db, officer=officer)

@router.put("/{officer_id}", response_model=OfficerOut)
async def update_officer(
    officer_id: int,
    officer_update: OfficerUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an officer's information.
    """
    db_officer = await officer_crud.update_officer(db, officer_id, officer_update)
    if db_officer is None:
        raise HTTPException(status_code=404, detail="Officer not found")
    return db_officer

@router.delete("/{officer_id}")
async def delete_officer(officer_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete an officer.
    """
    success = await officer_crud.delete_officer(db, officer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Officer not found")
    return {"detail": "Officer deleted successfully"}