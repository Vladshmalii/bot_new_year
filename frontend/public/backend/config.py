import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://dnd_user:dnd_password@localhost:5432/dnd_db"
    CORS_ORIGINS: str = "*"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = 'utf-8'


settings = Settings()

DATABASE_URL = settings.DATABASE_URL

def get_cors_origins() -> List[str]:
    """Parse CORS origins from comma-separated string"""
    if settings.CORS_ORIGINS == "*":
        return ["*"]
    return [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

CORS_ORIGINS = get_cors_origins()

