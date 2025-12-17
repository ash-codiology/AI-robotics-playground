from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Optional, Dict, Any
from src.config.settings import settings
from src.models.entities import RetrievedChunk
import logging
from src.models.rag import RAGContext
import time
from src.utils.content_loader import ensure_content_loaded

logger = logging.getLogger(__name__)


class RetrievalService:
    def __init__(self):
        # Try to connect to the configured Qdrant instance
        connection_successful = False
        try:
            # Check if using local/in-memory instance
            if settings.qdrant_url.lower() in ['local', 'memory', ':memory:', 'in-memory']:
                self.client = QdrantClient(":memory:", timeout=30)
                logger.info("Using in-memory Qdrant instance for development")
                connection_successful = True
            else:
                self.client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key,
                    prefer_grpc=False,  # Using REST API
                    timeout=30  # Increase timeout for remote connections
                )
                logger.info(f"Connected to Qdrant at {settings.qdrant_url}")
                connection_successful = True
        except Exception as e:
            logger.warning(f"Could not connect to Qdrant at {settings.qdrant_url}: {str(e)}")
            logger.info("Using in-memory Qdrant instance for development...")

            # If connection fails, use in-memory storage
            try:
                self.client = QdrantClient(":memory:", timeout=30)
                logger.info("Using in-memory Qdrant instance for development")
                connection_successful = True
            except Exception as local_error:
                logger.error(f"Could not create in-memory Qdrant instance: {str(local_error)}")
                raise local_error

        self.collection_name = "book_content"

        # Ensure collection exists with proper configuration before loading content
        self._ensure_collection_exists()

        # Load content into the vector database; ensure_content_loaded may return an effective collection name
        try:
            effective = ensure_content_loaded(self.client, self.collection_name)
            if effective:
                self.collection_name = effective
                logger.info(f"Using collection '{self.collection_name}' for retrieval")
        except Exception as e:
            logger.warning(f"Could not ensure content loaded: {str(e)}")

    def _ensure_collection_exists(self):
        """Ensure the collection exists with proper configuration."""
        try:
            # Check if collection exists
            collection_info = self.client.get_collection(self.collection_name)
            # Robustly try to extract existing vector size for logging
            existing_size = None
            try:
                existing_size = collection_info.vectors_config.size
            except Exception:
                try:
                    existing_size = collection_info.config.params.vectors.size
                except Exception:
                    try:
                        existing_size = list(collection_info.vectors.values())[0].size
                    except Exception:
                        existing_size = None

            logger.info(f"Collection '{self.collection_name}' already exists with vector size: {existing_size}")
        except Exception as e:
            logger.warning(f"Collection '{self.collection_name}' does not exist, creating it: {str(e)}")
            try:
                # Create collection if it doesn't exist - use 384 size which matches our content loader fallback
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=384,  # Size for local embeddings (sentence-transformers default)
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Created collection '{self.collection_name}' with size 384")
            except Exception as create_error:
                logger.warning(f"Could not create collection with size 384: {str(create_error)}")
                try:
                    # Fallback to 1024 size for Cohere compatibility if 384 fails
                    self.client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=models.VectorParams(
                            size=1024,  # Cohere embedding size
                            distance=models.Distance.COSINE
                        )
                    )
                    logger.info(f"Created collection '{self.collection_name}' with fallback size 1024")
                except Exception as fallback_error:
                    logger.warning(f"Could not create collection with fallback size: {str(fallback_error)}")
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
            # Generate embedding for the query using local embeddings
            embeddings = self._generate_embeddings_with_rate_limit([query], "search_query")

            if not embeddings or len(embeddings) == 0:
                logger.warning("Failed to generate embedding for query, using fallback content")
                # Return some fallback content when embeddings fail
                return self._get_fallback_content(top_k)

            query_vector = embeddings[0]

            # Search in Qdrant using the newer API
            try:
                search_results = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    limit=top_k,
                    with_payload=True
                ).points
            except Exception as search_error:
                # Check if it's a dimension mismatch error
                error_str = str(search_error)
                if "Vector dimension error" in error_str or "expected dim" in error_str:
                    logger.warning(f"Vector dimension mismatch detected: {error_str}")
                    # Recreate collection with correct dimension
                    vector_size = len(query_vector) if query_vector else 384
                    logger.info(f"Recreating collection '{self.collection_name}' with vector size {vector_size}")

                    try:
                        self.client.delete_collection(self.collection_name)
                    except:
                        pass  # Collection might not exist yet

                    self.client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=models.VectorParams(
                            size=vector_size,
                            distance=models.Distance.COSINE
                        )
                    )
                    logger.info(f"Recreated collection '{self.collection_name}' with vector size {vector_size}")

                    # After recreating collection, return fallback content since it's now empty
                    return self._get_fallback_content(top_k)
                else:
                    logger.warning(f"Search failed: {str(search_error)}, using fallback content")
                    return self._get_fallback_content(top_k)

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

            # If no results found but we have vectors, return fallback content
            if not results:
                logger.info("No search results found, using fallback content")
                return self._get_fallback_content(top_k)

            return results
        except Exception as e:
            logger.error(f"Error during content retrieval: {str(e)}")

            # Return fallback content instead of empty list
            return self._get_fallback_content(top_k)

    def _get_fallback_content(self, top_k: int) -> List[RetrievedChunk]:
        """
        Get fallback content when vector search fails.
        """
        logger.info("Returning fallback content for query")

        # Sample fallback content about robotics and AI
        fallback_contents = [
            {
                "content": "Physical AI & Humanoid Robotics Course: This course covers the fundamentals of physical artificial intelligence and humanoid robotics. Topics include ROS 2, simulation environments, Isaac Gym, Vision-Language-Action models, and embodied intelligence.",
                "metadata": {"source": "course_introduction", "type": "overview"}
            },
            {
                "content": "ROS 2 (Robot Operating System 2) is a flexible framework for writing robot software. It provides improved security, real-time support, and better cross-platform compatibility compared to ROS 1.",
                "metadata": {"source": "module_1", "type": "concept"}
            },
            {
                "content": "Simulation is crucial in robotics development. It allows for testing and validation of robot behaviors in a safe, controlled environment before deployment on physical hardware.",
                "metadata": {"source": "module_2", "type": "concept"}
            },
            {
                "content": "Isaac Gym provides GPU-accelerated physics simulation for robot learning. It enables the training of reinforcement learning agents directly on GPU, dramatically increasing training speed.",
                "metadata": {"source": "module_3", "type": "concept"}
            },
            {
                "content": "Vision-Language-Action (VLA) models integrate visual perception, language understanding, and action execution. These models enable robots to understand natural language commands.",
                "metadata": {"source": "module_4", "type": "concept"}
            }
        ]

        # Return up to top_k fallback items
        results = []
        for i, item in enumerate(fallback_contents[:top_k]):
            if i < len(fallback_contents):
                chunk = RetrievedChunk(
                    content=item["content"],
                    metadata=item["metadata"],
                    similarity_score=0.1,  # Low score to indicate fallback
                    source_id=f"fallback_{i}"
                )
                results.append(chunk)

        return results

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
            # Generate embedding for the content using Cohere with rate limiting
            embeddings = self._generate_embeddings_with_rate_limit([content], "search_document")

            if not embeddings or len(embeddings) == 0:
                logger.error("Failed to generate embedding for content")
                return

            content_vector = embeddings[0]

            # Try to upsert with the generated vector
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
            # Try to recreate the collection with the correct vector size
            try:
                logger.info("Attempting to recreate collection with correct vector size...")
                # Get the size of the vector we're trying to insert
                vector_size = len(content_vector)

                # Delete and recreate the collection with the correct size
                try:
                    self.client.delete_collection(self.collection_name)
                except:
                    pass  # Collection might not exist yet

                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Recreated collection '{self.collection_name}' with vector size {vector_size}")

                # Now try to upsert again
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
            except Exception as recreate_error:
                logger.error(f"Error recreating collection: {str(recreate_error)}")
                raise

    def batch_add_content(self, points_data: List[Dict[str, Any]]):
        """
        Add multiple content items to the Qdrant collection.

        Args:
            points_data: List of dictionaries containing id, content, and metadata
        """
        try:
            # Extract all content texts to generate embeddings with rate limiting
            content_texts = [data["content"] for data in points_data]

            # Generate embeddings with rate limiting to avoid API limits
            embeddings = self._generate_embeddings_with_rate_limit(content_texts, "search_document")

            points = []
            for data, embedding in zip(points_data, embeddings):
                # Check if embedding is valid
                if len(embedding) == 0 or all(v == 0.0 for v in embedding):
                    logger.warning(f"Skipping content due to invalid embedding")
                    continue

                points.append(
                    models.PointStruct(
                        id=data["id"],
                        vector=embedding,
                        payload={
                            "content": data["content"],
                            **data["metadata"]
                        }
                    )
                )

            # Try to upsert with the generated points
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
        except Exception as e:
            logger.error(f"Error during batch add to Qdrant: {str(e)}")
            # Try to recreate the collection with the correct vector size
            try:
                if points:
                    logger.info("Attempting to recreate collection with correct vector size...")
                    # Get the size of the first vector to determine collection size
                    vector_size = len(points[0].vector)

                    # Delete and recreate the collection with the correct size
                    try:
                        self.client.delete_collection(self.collection_name)
                    except:
                        pass  # Collection might not exist yet

                    self.client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=models.VectorParams(
                            size=vector_size,
                            distance=models.Distance.COSINE
                        )
                    )
                    logger.info(f"Recreated collection '{self.collection_name}' with vector size {vector_size}")

                    # Now try to upsert again
                    self.client.upsert(
                        collection_name=self.collection_name,
                        points=points
                    )
            except Exception as recreate_error:
                logger.error(f"Error recreating collection: {str(recreate_error)}")
                raise

    def _generate_embeddings_with_rate_limit(self, texts: List[str], input_type: str = "search_document"):
        """
        Generate embeddings using local model.
        Falls back to zero vectors if local model is not available.
        """
        from src.utils.content_loader import _generate_embeddings_with_rate_limit
        return _generate_embeddings_with_rate_limit(texts, input_type)


# Global instance
retrieval_service = RetrievalService()