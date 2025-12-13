# Implementation Plan: RAG Chatbot for Digital Book Readers

**Branch**: `002-rag-chatbot-for-book-readers` | **Date**: 2025-12-13 | **Spec**: [link to spec](spec.md)
**Input**: Feature specification from `/specs/002-rag-chatbot-for-book-readers/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Backend-only RAG chatbot implementation for digital book readers using FastAPI, Cohere for LLM processing, Qdrant Cloud for vector storage, and Neon Serverless Postgres for metadata. The system will strictly follow the project constitution by ensuring all responses are grounded exclusively in book content with no hallucination, supporting both full-book retrieval and selected-text-only modes.

## Technical Context

**Language/Version**: Python 3.11
**Primary Dependencies**: FastAPI, Cohere, Qdrant, Neon Postgres, Pydantic, SQLAlchemy
**Storage**: Qdrant Cloud (vector DB), Neon Serverless Postgres (metadata)
**Testing**: pytest
**Target Platform**: Linux server
**Project Type**: web (backend API)
**Performance Goals**: Response time under 5 seconds for 95% of requests, support 1000 concurrent users
**Constraints**: <5 second p95 response time, <500MB memory usage, GDPR compliant, no user query logging
**Scale/Scope**: 1000 concurrent users, 1M book content chunks, 10k daily queries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Strict Contextual Grounding**: Implementation must ensure responses are strictly based on retrieved context or selected text, with no external knowledge
- **II. Fidelity Over Fluency**: System must preserve original meaning and admit limitations when context is ambiguous
- **III. User-Centric Restrictive Mode**: Selected-text mode must respond exclusively based on provided selected text
- **IV. Transparency and Boundaries**: Responses must clearly distinguish between full-book context and selected text
- **V. Response Quality Standards**: Professional, helpful, neutral, and engaging tone maintained
- **VI. Insufficient Information Protocol**: System must explicitly state when context is insufficient

## Project Structure

### Documentation (this feature)
```text
specs/002-rag-chatbot-for-book-readers/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
```text
backend/
├── src/
│   ├── models/
│   │   ├── rag.py           # RAG engine models
│   │   ├── entities.py      # Data models for book content, queries, responses
│   │   └── metadata.py      # Database models for Neon Postgres
│   ├── services/
│   │   ├── rag_engine.py    # Core RAG engine service
│   │   ├── retrieval.py     # Retrieval service using Qdrant
│   │   ├── generation.py    # Generation service using Cohere
│   │   └── book_content.py  # Book content management service
│   ├── api/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── routes/
│   │   │   └── query.py     # Query endpoint
│   │   └── middleware/
│   │       └── auth.py      # Authentication middleware
│   ├── config/
│   │   └── settings.py      # Configuration and environment variables
│   └── utils/
│       ├── validators.py    # Input validation utilities
│       └── helpers.py       # General utility functions
└── tests/
    ├── unit/
    ├── integration/
    └── contract/
```

**Structure Decision**: Backend-only structure with FastAPI as the web framework, organized by functional layers (models, services, API routes) to maintain separation of concerns and support the RAG architecture requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |