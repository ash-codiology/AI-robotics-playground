from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config.settings import settings
from src.api.routes import query, auth, conversation
from src.utils.helpers import setup_logging
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    """
    # Startup
    setup_logging(settings.log_level)
    logger = logging.getLogger(__name__)
    logger.info("Starting RAG Chatbot API...")

    # Initialize RAG services during startup
    try:
        logger.info("Initializing RAG services...")

        # Import and initialize the RAG engine service which will initialize retrieval and generation
        from src.services.rag_engine import rag_engine_service
        from src.services.retrieval import retrieval_service
        from src.services.generation import generation_service

        # Wait for services to be properly initialized
        logger.info("RAG services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize RAG services: {str(e)}")
        raise e

    yield

    # Shutdown
    logger.info("Shutting down RAG Chatbot API...")


# Create FastAPI app instance
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan,
    debug=settings.debug
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Default React dev server
        "http://localhost:3001",  # Alternative React dev server
        "http://localhost:8080",  # Alternative dev server
        "http://localhost:8000",  # Backend server (for direct API access)
        "http://localhost:3006",  # Docusaurus dev server
        "http://localhost:3002",  # Docusaurus default
        "http://localhost:3003",  # Docusaurus alternative
        f"http://{settings.api_host}:{settings.api_port}",  # Backend server
        "*"  # Allow all origins during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(query.router, prefix="/api/v1", tags=["query"])
app.include_router(conversation.router, prefix="/api/v1", tags=["conversation"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

# Add a root endpoint
@app.get("/")
async def root():
    """
    Root endpoint for the API.

    Returns:
        A welcome message with API information.
    """
    return {
        "message": "Welcome to the RAG Chatbot for Digital Book Readers API",
        "version": settings.api_version,
        "title": settings.api_title
    }

# Additional global exception handlers could be added here if needed
@app.exception_handler(500)
async def internal_exception_handler(request, exc):
    """
    Global exception handler for internal server errors.
    """
    logging.error(f"Internal server error: {str(exc)}", exc_info=True)
    return {"detail": "An internal server error occurred"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True  # Only for development
    )