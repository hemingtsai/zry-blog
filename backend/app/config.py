from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://zryblog:zryblog@localhost:5432/zryblog"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    admin_username: str = "admin"
    admin_password: str = "admin123"

    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
