from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartDiet"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "local"
    AUTH_ENABLED: bool = False
    BETA_USER_EMAIL: str = "beta@smartdiet.example.com"
    BETA_USER_NAME: str = "Nutricionista Beta"
    SECRET_KEY: str = "change-me-before-production"
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://smartdiet:smartdiet@localhost:5432/smartdiet"
    )
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
