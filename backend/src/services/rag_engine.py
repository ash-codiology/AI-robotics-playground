from typing import List
from datetime import datetime
from src.models.rag import RAGRequest, RAGResponse, RAGContext, RAGConfig
from src.models.entities import RetrievedChunk
from src.services.retrieval import retrieval_service
from src.services.generation import generation_service
from src.services.conversations import conversation_store
from src.config.settings import settings
from src.utils.helpers import log_query_processing, log_retrieval_details
import logging

logger = logging.getLogger(__name__)


class RAGEngineService:
    def __init__(self):
        self.config = RAGConfig()
        self.retrieval_service = retrieval_service
        self.generation_service = generation_service
        self.conversation_store = conversation_store

    def process_query(self, request: RAGRequest) -> RAGResponse:
        """
        Process a RAG query and return a response.

        Args:
            request: The RAG request containing query, selected text, and mode

        Returns:
            RAGResponse containing the generated response and metadata
        """
        try:
            # Get conversation history if available
            conversation_history = None
            if request.conversation_id:
                conversation = self.conversation_store.get_conversation(request.conversation_id)
                if conversation:
                    conversation_history = conversation.messages

            # If no conversation history from store but it's provided in request, use it
            if not conversation_history and request.conversation_history:
                conversation_history = request.conversation_history

            # Create RAG context from the request
            rag_context = RAGContext(
                query=request.query,
                selected_text=request.selected_text,
                mode=request.mode,
                conversation_history=conversation_history,
                conversation_id=request.conversation_id
            )

            # Retrieve content based on the context
            rag_context = self.retrieval_service.retrieve_content_for_context(rag_context)

            # Log retrieval details
            log_retrieval_details(request.query, rag_context.retrieved_chunks)

            # Generate response based on the context
            response_text = self.generation_service.generate_response(rag_context, temperature=request.temperature, max_tokens=request.max_tokens)

            # Calculate confidence score based on similarity scores of retrieved chunks
            confidence_score = self._calculate_confidence_score(rag_context.retrieved_chunks)

            # Create and return the response
            response = RAGResponse(
                response=response_text,
                source_chunks=rag_context.retrieved_chunks,
                mode_used=rag_context.mode,
                confidence_score=confidence_score,
                conversation_id=request.conversation_id
            )

            # If conversation ID is provided, add this interaction to the conversation
            if request.conversation_id:
                # Add user query and assistant response to conversation
                user_message = {
                    "role": "user",
                    "content": request.query,
                    "timestamp": datetime.now().isoformat()
                }
                assistant_message = {
                    "role": "assistant",
                    "content": response_text,
                    "timestamp": datetime.now().isoformat()
                }

                # Get existing conversation or create a new one if needed
                conversation = self.conversation_store.get_conversation(request.conversation_id)
                if conversation:
                    # Update existing conversation with new messages
                    self.conversation_store.add_message_to_conversation(request.conversation_id, user_message)
                    self.conversation_store.add_message_to_conversation(request.conversation_id, assistant_message)
                else:
                    # If conversation doesn't exist, create a new one with the first exchange
                    from datetime import datetime
                    conversation = self.conversation_store.create_conversation(
                        title=request.query[:50] + "..." if len(request.query) > 50 else request.query,
                        mode=request.mode
                    )
                    self.conversation_store.add_message_to_conversation(conversation.id, user_message)
                    self.conversation_store.add_message_to_conversation(conversation.id, assistant_message)
                    response.conversation_id = conversation.id

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

            # Get conversation history if available
            conversation_history = None
            if request.conversation_id:
                conversation = self.conversation_store.get_conversation(request.conversation_id)
                if conversation:
                    conversation_history = conversation.messages

            # If no conversation history from store but it's provided in request, use it
            if not conversation_history and request.conversation_history:
                conversation_history = request.conversation_history

            # Create RAG context specifically for selected text mode
            rag_context = RAGContext(
                query=request.query,
                selected_text=request.selected_text,
                mode="selected_text",
                conversation_history=conversation_history,
                conversation_id=request.conversation_id
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
            response_text = self.generation_service.generate_response(rag_context, temperature=request.temperature, max_tokens=request.max_tokens)

            # Calculate confidence score (in selected text mode, we have perfect confidence in the source)
            confidence_score = 1.0

            # Create and return the response
            response = RAGResponse(
                response=response_text,
                source_chunks=rag_context.retrieved_chunks,
                mode_used=rag_context.mode,
                confidence_score=confidence_score,
                conversation_id=request.conversation_id
            )

            # If conversation ID is provided, add this interaction to the conversation
            if request.conversation_id:
                # Add user query and assistant response to conversation
                user_message = {
                    "role": "user",
                    "content": request.query,
                    "timestamp": datetime.now().isoformat()
                }
                assistant_message = {
                    "role": "assistant",
                    "content": response_text,
                    "timestamp": datetime.now().isoformat()
                }

                # Get existing conversation or create a new one if needed
                conversation = self.conversation_store.get_conversation(request.conversation_id)
                if conversation:
                    # Update existing conversation with new messages
                    self.conversation_store.add_message_to_conversation(request.conversation_id, user_message)
                    self.conversation_store.add_message_to_conversation(request.conversation_id, assistant_message)
                else:
                    # If conversation doesn't exist, create a new one with the first exchange
                    conversation = self.conversation_store.create_conversation(
                        title=request.query[:50] + "..." if len(request.query) > 50 else request.query,
                        mode=request.mode
                    )
                    self.conversation_store.add_message_to_conversation(conversation.id, user_message)
                    self.conversation_store.add_message_to_conversation(conversation.id, assistant_message)
                    response.conversation_id = conversation.id

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
        # Process the query (this will handle conversation memory)
        response = self.process_query(request)

        # Validate that the response is grounded in the context
        is_valid = self.validate_context_grounding(response.response, response.source_chunks)

        if not is_valid:
            # If validation fails, check if we have any context at all
            if response.source_chunks:
                # If we have source chunks but validation failed, try to provide a more useful response
                # rather than just saying insufficient information
                logger.warning("Response validation failed but we have source chunks - returning response with low confidence")
                response.confidence_score = 0.1  # Very low confidence but not zero
            else:
                # If we have no source chunks and validation failed, return insufficient information
                logger.warning("Response validation failed and no source chunks available - returning insufficient information response")
                response.response = "I don't have sufficient information in the provided context to answer this question accurately."
                response.confidence_score = 0.0

        # Ensure conversation ID is preserved in the response
        if request.conversation_id:
            response.conversation_id = request.conversation_id

        return response


# Global instance
rag_engine_service = RAGEngineService()