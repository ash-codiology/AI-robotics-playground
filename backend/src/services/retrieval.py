from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Optional, Dict, Any
from src.config.settings import settings
from src.models.entities import RetrievedChunk
import logging
import cohere
from src.models.rag import RAGContext
import time

logger = logging.getLogger(__name__)


class RetrievalService:
    def __init__(self):
        try:
            # Try to connect to the configured Qdrant instance
            self.client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                prefer_grpc=False  # Using REST API
            )
            logger.info(f"Connected to Qdrant at {settings.qdrant_url}")
        except Exception as e:
            logger.warning(f"Could not connect to Qdrant at {settings.qdrant_url}: {str(e)}")
            logger.info("Attempting to start local Qdrant instance...")

            # If connection fails, try to create a local instance using in-memory storage
            try:
                self.client = QdrantClient(":memory:")
                logger.info("Using in-memory Qdrant instance for development")
            except Exception as local_error:
                logger.error(f"Could not create in-memory Qdrant instance: {str(local_error)}")
                raise local_error

        self.cohere_client = cohere.Client(settings.cohere_api_key)
        self.collection_name = "book_content"
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """Ensure the collection exists with proper configuration."""
        try:
            # Check if collection exists
            self.client.get_collection(self.collection_name)
            logger.info(f"Collection '{self.collection_name}' already exists")
        except Exception as e:
            logger.warning(f"Collection '{self.collection_name}' does not exist, creating it: {str(e)}")
            try:
                # Create collection if it doesn't exist
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=1024,  # Assuming Cohere embeddings size, adjust as needed
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Created collection '{self.collection_name}'")
            except Exception as create_error:
                logger.warning(f"Could not create collection: {str(create_error)}")
                # For in-memory or local instances that might not support all operations
                logger.info(f"Collection '{self.collection_name}' may be created on first use")

    def retrieve_content(self, query: str, top_k: int = 5) -> List[RetrievedChunk]:
        """
        Retrieve relevant content from the Qdrant collection based on the query.

        Args:
            query: The query string
            top_k: Number of top results to return

        Returns:
            List of RetrievedChunk objects containing content and metadata
        """
        try:
            # Generate embedding for the query using Cohere
            response = self.cohere_client.embed(
                texts=[query],
                model="embed-english-v3.0",
                input_type="search_query"
            )
            query_vector = response.embeddings[0]

            # Search in Qdrant
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )

            results = []
            for result in search_results:
                chunk = RetrievedChunk(
                    content=result.payload.get("content", ""),
                    metadata={
                        "chapter": result.payload.get("chapter"),
                        "section": result.payload.get("section"),
                        "page_range": result.payload.get("page_range"),
                        "source_identifier": result.payload.get("source_identifier")
                    },
                    similarity_score=result.score,
                    source_id=str(result.id)
                )
                results.append(chunk)

            return results
        except Exception as e:
            logger.error(f"Error during content retrieval: {str(e)}")
            raise

    def retrieve_content_for_context(self, rag_context: RAGContext) -> RAGContext:
        """
        Retrieve content based on the RAG context and update it.

        Args:
            rag_context: The RAG context containing query and mode information

        Returns:
            Updated RAG context with retrieved content
        """
        if rag_context.mode == "selected_text" and rag_context.selected_text:
            # For selected text mode, we don't retrieve from Qdrant
            # Just create a chunk with the selected text
            chunk = RetrievedChunk(
                content=rag_context.selected_text,
                metadata={"source": "selected_text"},
                similarity_score=1.0,
                source_id="selected_text"
            )
            rag_context.retrieved_chunks = [chunk]
        else:
            # For full book mode, retrieve from Qdrant
            rag_context.retrieved_chunks = self.retrieve_content(rag_context.query)

        return rag_context

    def add_content(self, content_id: str, content: str, metadata: Dict[str, Any]):
        """
        Add content to the Qdrant collection after generating its embedding.

        Args:
            content_id: Unique identifier for the content
            content: The text content
            metadata: Additional metadata about the content
        """
        try:
            # Generate embedding for the content using Cohere
            response = self.cohere_client.embed(
                texts=[content],
                model="embed-english-v3.0",
                input_type="search_document"
            )
            content_vector = response.embeddings[0]

            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=content_id,
                        vector=content_vector,
                        payload={
                            "content": content,
                            **metadata
                        }
                    )
                ]
            )
        except Exception as e:
            logger.error(f"Error adding content to Qdrant: {str(e)}")
            raise

    def batch_add_content(self, points_data: List[Dict[str, Any]]):
        """
        Add multiple content items to the Qdrant collection.

        Args:
            points_data: List of dictionaries containing id, content, and metadata
        """
        try:
            points = []
            for data in points_data:
                # Generate embedding for the content using Cohere
                response = self.cohere_client.embed(
                    texts=[data["content"]],
                    model="embed-english-v3.0",
                    input_type="search_document"
                )
                content_vector = response.embeddings[0]

                points.append(
                    models.PointStruct(
                        id=data["id"],
                        vector=content_vector,
                        payload={
                            "content": data["content"],
                            **data["metadata"]
                        }
                    )
                )

            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
        except Exception as e:
            logger.error(f"Error during batch add to Qdrant: {str(e)}")
            raise


# Global instance
retrieval_service = RetrievalService()