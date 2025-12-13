# RAG Chatbot for Digital Book Readers

Backend API for a Retrieval-Augmented Generation (RAG) chatbot that assists digital book readers by providing contextually relevant answers based solely on the book's content.

## Overview

This backend implements a RAG-based chatbot system that:
- Retrieves relevant content from a book using vector search
- Generates responses using Cohere's language models
- Strictly adheres to the book's content (no external knowledge)
- Supports both full-book and selected-text modes
- Provides transparent source attribution

## Architecture

The system is built with:
- **Framework**: FastAPI
- **Language Model**: Cohere Command-R Plus
- **Vector Database**: Qdrant Cloud
- **Metadata Storage**: Neon Serverless Postgres
- **Language**: Python 3.11

## Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the backend directory with the following:
   ```env
   # Cohere Configuration
   COHERE_API_KEY=your_cohere_api_key

   # Qdrant Configuration
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_URL=your_qdrant_url

   # Database Configuration
   DATABASE_URL=your_neon_db_connection_string

   # Security
   SECRET_KEY=your_secret_key_for_auth

   # Application settings
   DEBUG=False
   LOG_LEVEL=INFO
   ```

3. **Run the Application**:
   ```bash
   cd backend
   uvicorn src.api.main:app --reload --port 8000
   ```

## API Usage

### Query Endpoint

```bash
POST /api/v1/query
Content-Type: application/json

{
  "query": "What does the book say about quantum computing?",
  "selected_text": null,
  "mode": "full_book"
}
```

### Selected Text Mode

```bash
POST /api/v1/query
Content-Type: application/json

{
  "query": "Explain this concept further",
  "selected_text": "The concept of quantum computing involves...",
  "mode": "selected_text"
}
```

### Response Format

```json
{
  "response": "The chatbot's answer based on the book content",
  "source_metadata": [
    {
      "id": "unique_chunk_id",
      "content": "Truncated content of the source chunk",
      "metadata": {
        "chapter": "Chapter Name",
        "section": "Section Name",
        "page_range": "Page Range",
        "source_identifier": "Source Identifier"
      },
      "similarity_score": 0.85,
      "attribution": {
        "chapter": "Chapter Name",
        "section": "Section Name",
        "page_range": "Page Range",
        "source_identifier": "Source Identifier"
      }
    }
  ],
  "mode_used": "full_book"
}
```

## Features

### Strict Contextual Grounding
- All responses are grounded exclusively in the book's indexed content
- No external knowledge, speculation, or hallucination
- Explicit "insufficient information" responses when context is inadequate

### Dual Modes
- **Full-book mode**: Searches entire book content for relevant information
- **Selected-text mode**: Responds exclusively based on user-selected text

### Source Transparency
- Clear attribution of information sources
- Confidence scoring for retrieved content
- Metadata including chapter, section, and page references

### Anti-Hallucination Measures
- Strict prompt engineering to prevent external knowledge usage
- Pattern detection for common hallucination indicators
- Validation that responses are grounded in provided context

## Project Structure

```
backend/
├── src/
│   ├── models/           # Data models and API schemas
│   │   ├── rag.py        # RAG-specific models
│   │   ├── entities.py   # API request/response models
│   │   └── metadata.py   # Database models
│   ├── services/         # Business logic
│   │   ├── rag_engine.py # Core RAG processing
│   │   ├── retrieval.py  # Qdrant integration
│   │   └── generation.py # Cohere integration
│   ├── api/              # API endpoints
│   │   ├── main.py       # Application entry point
│   │   ├── routes/       # API route definitions
│   │   └── middleware/   # Authentication and other middleware
│   ├── config/           # Configuration management
│   │   └── settings.py   # Application settings
│   └── utils/            # Utility functions
│       ├── validators.py # Request validation
│       └── helpers.py    # Helper functions
├── tests/                # Test files
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Project configuration
└── README.md             # This file
```

## Development

- Run tests: `pytest`
- Format code: `black .`
- Lint code: `flake8`

## Security

- API authentication middleware (currently commented out in routes)
- Environment variable management for sensitive data
- Input validation and sanitization
- No logging of user queries for privacy

## Performance

- Optimized vector search with Qdrant
- Caching strategies (to be implemented)
- Efficient context building to respect token limits