from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from src.models.entities import QueryRequest, QueryResponse, HealthCheck
from src.services.rag_engine import rag_engine_service
from src.api.middleware.auth import require_auth
from src.models.rag import RAGRequest, RAGContext
from src.utils.validators import validate_and_sanitize_request
from src.utils.helpers import format_attribution_for_response
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/conversation", response_model=QueryResponse)
async def conversation_endpoint(
    request: QueryRequest,
    # Uncomment the next line to require authentication
    # user_id: str = Depends(require_auth)
) -> QueryResponse:
    """
    General conversation endpoint for the chatbot with conversation memory.
    This endpoint allows for conversation with memory of previous interactions.

    Args:
        request: QueryRequest containing the query and optional conversation context

    Returns:
        QueryResponse containing the chatbot's answer with conversation metadata
    """
    try:
        logger.info(f"Processing conversation query: {request.query[:50]}...")  # Log first 50 chars

        # Validate and sanitize the request
        validated_request = validate_and_sanitize_request(request)

        # Create a RAG request with conversation support
        rag_request = RAGRequest(
            query=validated_request.query,
            selected_text=validated_request.selected_text,
            mode="conversation",  # Conversation mode
            conversation_id=getattr(validated_request, 'conversation_id', None),
            temperature=getattr(validated_request, 'temperature', 0.7),
            max_tokens=getattr(validated_request, 'max_tokens', 500)
        )

        # Process the query using the RAG engine with conversation memory
        rag_response = rag_engine_service.process_query(rag_request)

        # Create a response with source metadata
        api_response = QueryResponse(
            response=rag_response.response,
            source_metadata=[
                {
                    "content": chunk.content,
                    "source_id": chunk.source_id,
                    "similarity_score": chunk.similarity_score,
                    "metadata": chunk.metadata
                }
                for chunk in rag_response.source_chunks
            ],
            mode_used=rag_response.mode_used,
            conversation_id=rag_response.conversation_id
        )

        # Include conversation ID in the response if available
        if rag_response.conversation_id:
            # Add conversation ID to the response (we need to add this to QueryResponse model if needed)
            pass

        logger.info("Conversation query processed successfully")
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
        logger.error(f"Error processing conversation query: {str(e)}")
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


@router.get("/conversations")
async def list_conversations():
    """
    List all conversations.

    Returns:
        List of conversation objects
    """
    try:
        conversations = rag_engine_service.conversation_store.list_conversations()
        return {
            "conversations": [
                {
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "mode": conv.mode,
                    "message_count": len(conv.messages)
                }
                for conv in conversations
            ]
        }
    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving conversations"
        )


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Get a specific conversation by ID.

    Args:
        conversation_id: The ID of the conversation to retrieve

    Returns:
        Conversation object with messages
    """
    try:
        conversation = rag_engine_service.conversation_store.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        return {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "mode": conversation.mode,
            "messages": conversation.messages
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving the conversation"
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a specific conversation by ID.

    Args:
        conversation_id: The ID of the conversation to delete

    Returns:
        Success message
    """
    try:
        success = rag_engine_service.conversation_store.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        return {
            "message": "Conversation deleted successfully",
            "conversation_id": conversation_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting the conversation"
        )


@router.delete("/conversations")
async def clear_all_conversations():
    """
    Delete all conversations.

    Returns:
        Success message
    """
    try:
        rag_engine_service.conversation_store.clear_conversations()
        return {
            "message": "All conversations cleared successfully"
        }
    except Exception as e:
        logger.error(f"Error clearing conversations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while clearing conversations"
        )