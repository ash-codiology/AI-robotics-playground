from typing import List
from src.models.rag import RAGRequest, RAGResponse, RAGContext, RAGConfig
from src.models.entities import RetrievedChunk
from src.services.retrieval import retrieval_service
from src.services.generation import generation_service
from src.config.settings import settings
from src.utils.helpers import log_query_processing, log_retrieval_details
import logging

logger = logging.getLogger(__name__)


class RAGEngineService:
    def __init__(self):
        self.config = RAGConfig()
        self.retrieval_service = retrieval_service
        self.generation_service = generation_service

    def process_query(self, request: RAGRequest) -> RAGResponse:
        """
        Process a RAG query and return a response.

        Args:
            request: The RAG request containing query, selected text, and mode

        Returns:
            RAGResponse containing the generated response and metadata
        """
        try:
            # Create RAG context from the request
            rag_context = RAGContext(
                query=request.query,
                selected_text=request.selected_text,
                mode=request.mode
            )

            # Retrieve content based on the context
            rag_context = self.retrieval_service.retrieve_content_for_context(rag_context)

            # Log retrieval details
            log_retrieval_details(request.query, rag_context.retrieved_chunks)

            # Generate response based on the context
            response_text = self.generation_service.generate_response(rag_context)

            # Calculate confidence score based on similarity scores of retrieved chunks
            confidence_score = self._calculate_confidence_score(rag_context.retrieved_chunks)

            # Create and return the response
            response = RAGResponse(
                response=response_text,
                source_chunks=rag_context.retrieved_chunks,
                mode_used=rag_context.mode,
                confidence_score=confidence_score
            )

            # Log query processing
            log_query_processing(request.query, request.mode, response_text, rag_context.retrieved_chunks)

            return response

        except Exception as e:
            logger.error(f"Error during RAG processing: {str(e)}")
            raise

    def process_selected_text_mode(self, request: RAGRequest) -> RAGResponse:
        """
        Process a query specifically in selected text mode, ensuring only the selected text is used.

        Args:
            request: The RAG request containing query and selected text

        Returns:
            RAGResponse containing the generated response and metadata
        """
        try:
            # Validate that selected text mode has the required data
            if not request.selected_text:
                raise ValueError("Selected text is required for selected text mode")

            # Create RAG context specifically for selected text mode
            rag_context = RAGContext(
                query=request.query,
                selected_text=request.selected_text,
                mode="selected_text"
            )

            # For selected text mode, we don't retrieve from Qdrant
            # Just create a chunk with the selected text
            from src.models.entities import RetrievedChunk
            chunk = RetrievedChunk(
                content=request.selected_text,
                metadata={"source": "selected_text"},
                similarity_score=1.0,
                source_id="selected_text"
            )
            rag_context.retrieved_chunks = [chunk]

            # Log retrieval details
            log_retrieval_details(request.query, rag_context.retrieved_chunks)

            # Generate response based on the context (which contains only selected text)
            response_text = self.generation_service.generate_response(rag_context)

            # Calculate confidence score (in selected text mode, we have perfect confidence in the source)
            confidence_score = 1.0

            # Create and return the response
            response = RAGResponse(
                response=response_text,
                source_chunks=rag_context.retrieved_chunks,
                mode_used=rag_context.mode,
                confidence_score=confidence_score
            )

            # Log query processing
            log_query_processing(request.query, request.mode, response_text, rag_context.retrieved_chunks)

            return response

        except Exception as e:
            logger.error(f"Error during selected text mode processing: {str(e)}")
            raise

    def _calculate_confidence_score(self, retrieved_chunks: List[RetrievedChunk]) -> float:
        """
        Calculate a confidence score based on the retrieved chunks.

        Args:
            retrieved_chunks: List of retrieved chunks

        Returns:
            Confidence score between 0 and 1
        """
        if not retrieved_chunks:
            return 0.0

        # Calculate average similarity score
        total_score = sum(chunk.similarity_score for chunk in retrieved_chunks)
        avg_score = total_score / len(retrieved_chunks)

        # Normalize the score to be between 0 and 1
        # Assuming similarity scores are between 0 and 1
        return min(1.0, max(0.0, avg_score))

    def validate_context_grounding(self, response: str, context_chunks: List[RetrievedChunk]) -> bool:
        """
        Validate that the response is grounded in the provided context.

        Args:
            response: The generated response
            context_chunks: The context chunks used for generation

        Returns:
            True if the response is properly grounded, False otherwise
        """
        # Use the generation service's validation method
        return self.generation_service.validate_response_against_context(response, context_chunks)

    def process_query_with_validation(self, request: RAGRequest) -> RAGResponse:
        """
        Process a RAG query with additional validation for grounding.

        Args:
            request: The RAG request containing query, selected text, and mode

        Returns:
            RAGResponse containing the generated response and metadata
        """
        response = self.process_query(request)

        # Validate that the response is grounded in the context
        is_valid = self.validate_context_grounding(response.response, response.source_chunks)

        if not is_valid:
            # If validation fails, return a response indicating insufficient information
            logger.warning("Response validation failed - returning insufficient information response")
            response.response = "I don't have sufficient information in the provided context to answer this question accurately."
            response.source_chunks = []
            response.confidence_score = 0.0

        return response


# Global instance
rag_engine_service = RAGEngineService()