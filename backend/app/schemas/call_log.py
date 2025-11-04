# app/schemas/call_log.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CallLogBase(BaseModel):
    lead_id: Optional[int] = None
    officer_id: Optional[int] = None
    call_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    channel: Optional[str] = None
    transcription: Optional[str] = None
    summary: Optional[str] = None
    intent: Optional[str] = None
    objections: Optional[str] = None
    sentiment: Optional[str] = None

class CallLogCreate(CallLogBase):
    pass  # all fields optional for now

class CallLogOut(CallLogBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
