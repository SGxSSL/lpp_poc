from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class OfficerBase(BaseModel):
    id: int
    name: str
    region: Optional[str] = None
    specialty: Optional[str] = None
    experience_years: Optional[int] = 0
    created_at: datetime

    class Config:
        orm_mode = True

class CallLogBase(BaseModel):
    id: int
    lead_id: Optional[int] = None
    officer_id: Optional[int] = None
    call_date: datetime
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    channel: Optional[str] = None
    transcription: Optional[str] = None
    summary: Optional[str] = None
    intent: Optional[str] = None
    objections: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime
    officer: Optional[OfficerBase] = None

    class Config:
        orm_mode = True

class LeadDetailResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    credit_score: Optional[int] = None
    interest_level: Optional[int] = None
    last_contact_date: Optional[datetime] = None
    source: Optional[str] = None
    status: Optional[str] = None
    lead_type: Optional[str] = None
    created_at: datetime
    call_logs: List[CallLogBase] = []

    class Config:
        orm_mode = True