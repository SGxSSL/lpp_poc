from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    PROJECT_NAME: str = "CRM Backend"
    ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()