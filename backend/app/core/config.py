from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized application configuration.
    All values are overridable via environment variables or a `.env` file.
    """

    # =========================
    # Database Configuration
    # =========================
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "admin"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "job_portaldb"

    # =========================
    # JWT Authentication
    # =========================
    # NOTE: SECRET_KEY MUST be overridden via .env in any non-local environment.
    SECRET_KEY: str = "CHANGE_ME_IN_ENV"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # =========================
    # CORS
    # =========================
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # =========================
    # File Uploads
    # =========================
    RESUME_UPLOAD_DIR: str = "app/uploads/resumes"
    MAX_RESUME_SIZE_MB: int = 5

    # =========================
    # App Configuration
    # =========================
    DEBUG: bool = True

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [self.FRONTEND_ORIGIN]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
