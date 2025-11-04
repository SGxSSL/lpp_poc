import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# ✅ Local database — no SSL or special args needed
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Logs SQL queries, good for debugging
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# ✅ Dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
