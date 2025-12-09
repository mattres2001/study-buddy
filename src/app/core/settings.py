from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "studybuddy"


model_config = SettingsConfigDict(env_file=".env", env_prefix="")


settings = Settings()
