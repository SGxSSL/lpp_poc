# app/schemas/lead.py
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


class LeadBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    credit_score: Optional[int] = None
    interest_level: Optional[int] = None
    last_contact_date: Optional[date] = None
    source: Optional[str] = None
    status: Optional[str] = None
    lead_type: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(LeadBase):
    pass


class LeadOut(LeadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
