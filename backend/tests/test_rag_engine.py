import pytest
from unittest.mock import Mock, patch
from src.services.rag_engine import RAGEngineService
from src.models.rag import RAGRequest, RAGContext
from src.models.entities import RetrievedChunk


class TestRAGEngineService:
    """Test cases for the RAG Engine Service."""

    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.rag_engine = RAGEngineService()

    def test_process_query_with_empty_context(self):
        """Test processing a query when no context is available."""
        request = RAGRequest(
            query="What is quantum computing?",
            selected_text=None,
            mode="full_book"
        )

        # Mock the retrieval service to return empty context
        with patch.object(self.rag_engine.retrieval_service, 'retrieve_content_for_context') as mock_retrieve:
            mock_retrieve.return_value = RAGContext(
                query=request.query,
                retrieved_chunks=[],
                selected_text=None,
                mode=request.mode
            )

            # Mock the generation service to return the insufficient info response
            with patch.object(self.rag_engine.generation_service, 'generate_response') as mock_generate:
                mock_generate.return_value = "I don't have sufficient information in the provided context to answer this question accurately."

                response = self.rag_engine.process_query(request)

                assert "I don't have sufficient information" in response.response
                assert response.mode_used == request.mode

    def test_process_selected_text_mode(self):
        """Test processing in selected text mode."""
        selected_text = "Quantum computing is a type of computation that harnesses quantum mechanics."
        request = RAGRequest(
            query="Explain quantum computing",
            selected_text=selected_text,
            mode="selected_text"
        )

        response = self.rag_engine.process_selected_text_mode(request)

        assert response.mode_used == "selected_text"
        assert len(response.source_chunks) == 1
        assert response.source_chunks[0].content == selected_text
        assert response.confidence_score == 1.0

    def test_calculate_confidence_score_with_chunks(self):
        """Test confidence score calculation with retrieved chunks."""
        chunks = [
            RetrievedChunk(
                content="Content 1",
                metadata={"source": "source1"},
                similarity_score=0.8,
                source_id="1"
            ),
            RetrievedChunk(
                content="Content 2",
                metadata={"source": "source2"},
                similarity_score=0.6,
                source_id="2"
            )
        ]

        avg_score = self.rag_engine._calculate_confidence_score(chunks)
        expected_score = (0.8 + 0.6) / 2  # 0.7

        assert avg_score == expected_score

    def test_calculate_confidence_score_empty_chunks(self):
        """Test confidence score calculation with no chunks."""
        chunks = []

        avg_score = self.rag_engine._calculate_confidence_score(chunks)

        assert avg_score == 0.0


if __name__ == "__main__":
    pytest.main([__file__])