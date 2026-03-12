from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    news_api_key: str = "your_news_api_key_here"
    secret_key: str = "supersecretjwtkey2024politicalnews"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./political_news.db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://political-sentiment-analysis.vercel.app"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
