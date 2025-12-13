from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from src.models.entities import QueryRequest, QueryResponse, HealthCheck
from src.services.rag_engine import rag_engine_service
from src.api.middleware.auth import require_auth
from src.models.rag import RAGRequest
from src.utils.validators import validate_and_sanitize_request
from src.utils.helpers import format_attribution_for_response
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(
    request: QueryRequest,
    # Uncomment the next line to require authentication
    # user_id: str = Depends(require_auth)
) -> QueryResponse:
    """
    Query endpoint for the RAG chatbot.

    Args:
        request: QueryRequest containing the query, selected text, and mode

    Returns:
        QueryResponse containing the chatbot's answer and source metadata
    """
    try:
        logger.info(f"Processing query: {request.query[:50]}...")  # Log first 50 chars

        # Validate and sanitize the request
        validated_request = validate_and_sanitize_request(request)

        # Convert API request to RAG request
        rag_request = RAGRequest(
            query=validated_request.query,
            selected_text=validated_request.selected_text,
            mode=validated_request.mode
        )

        # Process the query differently based on mode
        if validated_request.mode == "selected_text" and validated_request.selected_text:
            # For selected text mode, use the dedicated method
            rag_response = rag_engine_service.process_selected_text_mode(rag_request)
        else:
            # For full book mode, use the standard processing
            rag_response = rag_engine_service.process_query_with_validation(rag_request)

        # Convert RAG response to API response with enhanced attribution
        api_response = QueryResponse(
            response=rag_response.response,
            source_metadata=format_attribution_for_response(rag_response.source_chunks),
            mode_used=rag_response.mode_used
        )

        logger.info("Query processed successfully")
        return api_response

    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request: {str(ve)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your query"
        )


@router.get("/health", response_model=HealthCheck)
async def health_check() -> HealthCheck:
    """
    Health check endpoint to verify the service is running.

    Returns:
        HealthCheck object with status and timestamp
    """
    return HealthCheck()


# Additional endpoints could be added here as needed