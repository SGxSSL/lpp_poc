# app/crud/officer_crud.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from datetime import datetime

from app.models.officer import Officer
from app.schemas.officer import OfficerCreate, OfficerUpdate

async def get_officers(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Officer]:
    result = await db.execute(
        select(Officer)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_officer(db: AsyncSession, officer_id: int) -> Optional[Officer]:
    result = await db.execute(
        select(Officer)
        .filter(Officer.id == officer_id)
    )
    return result.scalar_one_or_none()

async def get_officer_by_name(db: AsyncSession, name: str) -> Optional[Officer]:
    result = await db.execute(
        select(Officer)
        .filter(Officer.name == name)
    )
    return result.scalar_one_or_none()

async def create_officer(db: AsyncSession, officer: OfficerCreate) -> Officer:
    db_officer = Officer(
        name=officer.name,
        region=officer.region,
        specialty=officer.specialty,
        experience_years=officer.experience_years
    )
    db.add(db_officer)
    await db.commit()
    await db.refresh(db_officer)
    return db_officer

async def update_officer(db: AsyncSession, officer_id: int, officer_update: OfficerUpdate) -> Optional[Officer]:
    db_officer = await get_officer(db, officer_id)
    if not db_officer:
        return None
    
    update_data = officer_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_officer, field, value)
    
    await db.commit()
    await db.refresh(db_officer)
    return db_officer

async def delete_officer(db: AsyncSession, officer_id: int) -> bool:
    db_officer = await get_officer(db, officer_id)
    if not db_officer:
        return False
    
    await db.execute(
        delete(Officer)
        .filter(Officer.id == officer_id)
    )
    await db.commit()
    return True