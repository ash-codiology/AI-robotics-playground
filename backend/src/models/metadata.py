from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, UUID, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class BookContent(Base):
    __tablename__ = "book_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)  # the book content chunk
    chapter = Column(String, nullable=True)  # optional
    section = Column(String, nullable=True)  # optional
    page_range = Column(String, nullable=True)  # optional
    source_identifier = Column(String, nullable=False)
    # embedding_vector would be stored separately in Qdrant, not in Postgres
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UserQuery(Base):
    __tablename__ = "user_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_text = Column(Text, nullable=False)
    selected_text = Column(Text, nullable=True)  # optional, for selected text mode
    mode = Column(String, nullable=False)  # 'full_book' or 'selected_text'
    response_id = Column(UUID(as_uuid=True), ForeignKey("responses.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False, nullable=False)


class Response(Base):
    __tablename__ = "responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)  # the generated response
    source_chunks = Column(Text, nullable=True)  # JSON string of metadata about source content used
    confidence_score = Column(Float, nullable=True)  # 0-1
    created_at = Column(DateTime(timezone=True), server_default=func.now())