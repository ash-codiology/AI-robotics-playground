# Data Model: RAG Chatbot for Digital Book Readers

## Database Schema (Neon Postgres)

### BookContent
- id: UUID (primary key)
- content: TEXT (the book content chunk)
- chapter: VARCHAR (optional)
- section: VARCHAR (optional)
- page_range: VARCHAR (optional)
- source_identifier: VARCHAR
- embedding_vector: VECTOR (Cohere embedding)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### UserQuery
- id: UUID (primary key)
- query_text: TEXT
- selected_text: TEXT (optional, for selected text mode)
- mode: ENUM ('full_book', 'selected_text')
- response_id: UUID (foreign key to Response)
- created_at: TIMESTAMP
- processed: BOOLEAN (default: false)

### Response
- id: UUID (primary key)
- content: TEXT (the generated response)
- source_chunks: JSON (metadata about source content used)
- confidence_score: FLOAT (0-1)
- created_at: TIMESTAMP

## API Models (Pydantic)

### QueryRequest
- query: str (the user's question)
- selected_text: Optional[str] (text selected by user, if any)
- mode: Optional[Literal['full_book', 'selected_text']] (default: 'full_book')

### QueryResponse
- response: str (the chatbot's answer)
- source_metadata: List[Dict] (information about source content)
- mode_used: Literal['full_book', 'selected_text']

### HealthCheck
- status: str (always 'healthy')
- timestamp: datetime

## Service Models

### RetrievedChunk
- content: str (the retrieved content)
- metadata: Dict (chapter, section, page_range, etc.)
- similarity_score: float (from vector search)
- source_id: str (identifier for the source)

### RAGContext
- query: str (original user query)
- retrieved_chunks: List[RetrievedChunk] (relevant content)
- selected_text: Optional[str] (if in selected text mode)
- mode: Literal['full_book', 'selected_text']