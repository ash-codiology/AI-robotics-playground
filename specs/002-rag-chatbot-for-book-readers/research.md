# Research Notes: RAG Chatbot for Digital Book Readers

## Architecture Overview
- FastAPI backend with Cohere integration
- Qdrant Cloud for vector storage of book content
- Neon Serverless Postgres for metadata management
- Strict adherence to constitution principles

## Key Research Findings
- Cohere's command models are suitable for RAG applications
- Qdrant provides efficient similarity search for book content retrieval
- FastAPI offers excellent performance for API endpoints
- Pydantic models ensure proper data validation
- SQLAlchemy works well with Neon Postgres

## Technical Decisions
- Using Cohere embeddings for text vectorization
- Implementing top-k retrieval from Qdrant for context
- Applying anti-hallucination techniques in prompting
- Supporting both full-book and selected-text modes
- Implementing proper rate limiting and authentication

## Security Considerations
- No user queries will be logged
- Proper API authentication required
- GDPR compliance for any stored data
- Secure handling of API keys