from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent
_env_file = APP_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file.

    Locally: reads from backend/app/.env
    On Vercel: env vars are injected via the dashboard — no .env file needed.
    """

    model_config = SettingsConfigDict(
        env_file=str(_env_file) if _env_file.exists() else None,
        env_file_encoding="utf-8",
    )

    groq_api_key: str
    frontend_url: str 
    database_url: str 


settings = Settings()