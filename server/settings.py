# settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secretbox_key_b64: str

    class Config:
        env_prefix = ""
        env_file = ".env"

settings = Settings()