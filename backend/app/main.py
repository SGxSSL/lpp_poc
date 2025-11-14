from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import uvicorn
import logging

from app.core.database import get_db
from app.core.logger import setup_logging
from app.routers import lead_router, officer_router, analysis, dashboard_router


# ---------------------------------------------------------
# App Initialization
# ---------------------------------------------------------
logger = setup_logging()
logger.info("🚀 Starting FastAPI backend...")

app = FastAPI(
    title="CRM Backend API",
    description="FastAPI + PostgreSQL backend for CRM project",
    version="1.0.0"
)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lead_router.router)
app.include_router(officer_router.router)
app.include_router(analysis.router)
app.include_router(dashboard_router.router)

# ---------------------------------------------------------
# Health & DB Test Endpoints
# ---------------------------------------------------------
@app.get("/")
async def root():
    return {"message": "CRM Backend with PostgreSQL is running 🚀"}

@app.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT NOW()"))
        time_value = str(result.scalar())
        return {"message": "✅ Connected to PostgreSQL!", "time": time_value}
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------
# Entry Point
# ---------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
