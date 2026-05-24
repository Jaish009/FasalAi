# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    ML_SERVICE_SECRET: str = "dev-secret"
    AGMARKNET_API_KEY: str = ""
    PORT: int = 8000
    ENV: str = "development"
    MODEL_DIR: str = "./saved_models"
    RETRAIN_INTERVAL_HOURS: int = 24
    MIN_TRAINING_DAYS: int = 30
    NEXTJS_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
