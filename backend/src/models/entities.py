from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime


class QueryRequest(BaseModel):
    """API model for query requests."""
    query: str = Field(..., description="The user's question", min_length=3, max_length=1000)
    selected_text: Optional[str] = Field(None, description="Text selected by user, if any", max_length=5000)
    mode: Optional[Literal['full_book', 'selected_text']] = Field(
        'full_book',
        description="Query mode, defaults to 'full_book'"
    )


class SourceMetadata(BaseModel):
    """Model for source metadata in responses."""
    id: str
    content: str
    metadata: Dict[str, Optional[str]]  # chapter, section, page_range, source_identifier
    similarity_score: float


class QueryResponse(BaseModel):
    """API model for query responses."""
    response: str = Field(..., description="The chatbot's answer")
    source_metadata: List[SourceMetadata] = Field(
        default_factory=list,
        description="Information about source content used"
    )
    mode_used: Literal['full_book', 'selected_text'] = Field(
        ...,
        description="The mode that was actually used"
    )


class HealthCheck(BaseModel):
    """API model for health check responses."""
    status: str = Field("healthy", description="Always 'healthy'")
    timestamp: datetime = Field(default_factory=datetime.now)


class RetrievedChunk(BaseModel):
    """Service model for retrieved content chunks."""
    content: str
    metadata: Dict[str, Optional[str]]
    similarity_score: float
    source_id: str


class RAGContext(BaseModel):
    """Service model for RAG processing context."""
    query: str
    retrieved_chunks: List[RetrievedChunk] = Field(default_factory=list)
    selected_text: Optional[str] = None
    mode: Literal['full_book', 'selected_text']


class User(BaseModel):
    """Model for user information."""
    id: str
    name: str
    email: str
    bio: Optional[str] = None
    interests: Optional[List[str]] = Field(default_factory=list)
    country: Optional[str] = None
    createdDate: Optional[str] = None


class LoginRequest(BaseModel):
    """API model for login requests."""
    email: str = Field(..., description="User's email")
    password: str = Field(..., description="User's password", min_length=6)


class RegisterRequest(BaseModel):
    """API model for registration requests."""
    name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email")
    password: str = Field(..., description="User's password", min_length=6)
    bio: Optional[str] = Field(None, description="User's bio")
    interests: Optional[List[str]] = Field(default_factory=list, description="User's interests")
    country: Optional[str] = Field(None, description="User's country")


class LoginResponse(BaseModel):
    """API model for login/registration responses."""
    success: bool
    user: User
    token: str
    message: str