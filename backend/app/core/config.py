from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
APP_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=str(APP_DIR / ".env"),
        env_file_encoding="utf-8",
    )

    groq_api_key: str
    frontend_url: str
    database_url: str


settings = Settings()