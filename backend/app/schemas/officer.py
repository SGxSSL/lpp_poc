# app/schemas/officer.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OfficerBase(BaseModel):
    name: str
    region: Optional[str] = None
    specialty: Optional[str] = None
    experience_years: Optional[int] = 0


class OfficerCreate(OfficerBase):
    pass


class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    specialty: Optional[str] = None
    experience_years: Optional[int] = None


class OfficerOut(OfficerBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
