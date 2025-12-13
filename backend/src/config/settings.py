from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    api_title: str = "RAG Chatbot for Digital Book Readers"
    api_description: str = "Backend API for RAG-based chatbot that assists digital book readers"
    api_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Cohere Configuration
    cohere_api_key: str

    # Qdrant Configuration
    qdrant_api_key: str
    qdrant_url: str

    # Database Configuration
    database_url: str

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Application settings
    debug: bool = False
    log_level: str = "INFO"

    model_config = {"env_file": ".env"}


settings = Settings()