from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Configuration
    api_title: str = "RAG Chatbot for Digital Book Readers"
    api_description: str = "Backend API for RAG-based chatbot that assists digital book readers"
    api_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # LLM Provider Configuration
    llm_provider: str = "gemini"  # Options: gemini, openai, anthropic, ollama, openrouter
    google_gemini_api_key: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    openrouter_api_key: str = ""
    default_model: str = "gemini-2.0-flash"  # Default model to use

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