from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://lrweb:lrweb@localhost:5432/lrweb"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-change-in-production"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
