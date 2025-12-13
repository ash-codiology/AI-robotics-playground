from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from src.models.entities import RetrievedChunk


class RAGRequest(BaseModel):
    """Request model for RAG processing."""
    query: str
    selected_text: Optional[str] = None
    mode: Literal['full_book', 'selected_text'] = 'full_book'


class RAGResponse(BaseModel):
    """Response model for RAG processing."""
    response: str
    source_chunks: List[RetrievedChunk] = []
    mode_used: Literal['full_book', 'selected_text']
    confidence_score: Optional[float] = None


class RAGContext(BaseModel):
    """Context model for RAG processing (duplicated here for RAG-specific use)."""
    query: str
    retrieved_chunks: List[RetrievedChunk] = []
    selected_text: Optional[str] = None
    mode: Literal['full_book', 'selected_text']


class RAGConfig(BaseModel):
    """Configuration for RAG engine."""
    top_k: int = 5
    max_context_length: int = 3000  # Maximum characters for context
    min_similarity_score: float = 0.3
    enable_anti_hallucination: bool = True
    max_response_tokens: int = 500