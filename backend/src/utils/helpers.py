import logging
from datetime import datetime
from typing import Dict, Any, Optional
from src.models.entities import RetrievedChunk
import json


def setup_logging(log_level: str = "INFO"):
    """
    Set up logging configuration for the application.

    Args:
        log_level: The logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(),
            # In production, you might also want to add a file handler
        ]
    )


def log_query_processing(query: str, mode: str, response: str, source_chunks: Optional[list] = None):
    """
    Log query processing details.

    Args:
        query: The original query
        mode: The mode used (full_book or selected_text)
        response: The generated response
        source_chunks: List of source chunks used (optional)
    """
    logger = logging.getLogger(__name__)

    log_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "query_length": len(query),
        "mode": mode,
        "response_length": len(response),
        "source_chunks_count": len(source_chunks) if source_chunks else 0
    }

    logger.info(f"Query processed: {json.dumps(log_data)}")


def log_retrieval_details(query: str, retrieved_chunks: list[RetrievedChunk]):
    """
    Log details about content retrieval.

    Args:
        query: The query that was used for retrieval
        retrieved_chunks: List of retrieved chunks
    """
    logger = logging.getLogger(__name__)

    if not retrieved_chunks:
        logger.info(f"No content retrieved for query: {query[:50]}...")
        return

    avg_similarity = sum(chunk.similarity_score for chunk in retrieved_chunks) / len(retrieved_chunks)
    log_data = {
        "query": query[:100] + "..." if len(query) > 100 else query,
        "chunks_retrieved": len(retrieved_chunks),
        "avg_similarity_score": avg_similarity,
        "sources": list(set(chunk.metadata.get("source_identifier") for chunk in retrieved_chunks if chunk.metadata.get("source_identifier")))
    }

    logger.info(f"Retrieval details: {json.dumps(log_data)}")


def format_source_metadata_for_response(chunks: list[RetrievedChunk]) -> list[dict]:
    """
    Format retrieved chunks for inclusion in API response.

    Args:
        chunks: List of RetrievedChunk objects

    Returns:
        List of dictionaries formatted for API response
    """
    return [
        {
            "id": chunk.source_id,
            "content": chunk.content,
            "metadata": chunk.metadata,
            "similarity_score": chunk.similarity_score
        }
        for chunk in chunks
    ]


def truncate_text(text: str, max_length: int = 200) -> str:
    """
    Truncate text to a maximum length with ellipsis.

    Args:
        text: The text to truncate
        max_length: Maximum length of the text

    Returns:
        Truncated text with ellipsis if needed
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."


def calculate_similarity_threshold(chunks: list[RetrievedChunk], min_threshold: float = 0.3) -> list[RetrievedChunk]:
    """
    Filter chunks based on a minimum similarity threshold.

    Args:
        chunks: List of retrieved chunks
        min_threshold: Minimum similarity score threshold

    Returns:
        List of chunks that meet the threshold
    """
    return [chunk for chunk in chunks if chunk.similarity_score >= min_threshold]


def extract_source_attribution(chunks: list[RetrievedChunk]) -> dict:
    """
    Extract source attribution information from retrieved chunks.

    Args:
        chunks: List of retrieved chunks

    Returns:
        Dictionary containing source attribution information
    """
    if not chunks:
        return {
            "total_sources": 0,
            "unique_sources": [],
            "source_distribution": {},
            "confidence_ranges": {
                "high": [],  # similarity score >= 0.8
                "medium": [],  # similarity score 0.5-0.79
                "low": []  # similarity score < 0.5
            }
        }

    # Get unique source identifiers
    unique_sources = list(set(
        chunk.metadata.get("source_identifier")
        for chunk in chunks
        if chunk.metadata.get("source_identifier")
    ))

    # Count distribution by source
    source_distribution = {}
    for chunk in chunks:
        source_id = chunk.metadata.get("source_identifier", "unknown")
        if source_id in source_distribution:
            source_distribution[source_id] += 1
        else:
            source_distribution[source_id] = 1

    # Categorize by confidence/similarity
    confidence_ranges = {
        "high": [chunk for chunk in chunks if chunk.similarity_score >= 0.8],
        "medium": [chunk for chunk in chunks if 0.5 <= chunk.similarity_score < 0.8],
        "low": [chunk for chunk in chunks if chunk.similarity_score < 0.5]
    }

    return {
        "total_sources": len(chunks),
        "unique_sources": unique_sources,
        "source_distribution": source_distribution,
        "confidence_ranges": confidence_ranges
    }


def format_attribution_for_response(chunks: list[RetrievedChunk]) -> list[dict]:
    """
    Format retrieved chunks with detailed attribution for API response.

    Args:
        chunks: List of retrieved chunks

    Returns:
        List of dictionaries with detailed attribution information
    """
    return [
        {
            "id": chunk.source_id,
            "content": truncate_text(chunk.content, 200),  # Truncate long content
            "metadata": chunk.metadata,
            "similarity_score": chunk.similarity_score,
            "attribution": {
                "chapter": chunk.metadata.get("chapter", "Unknown"),
                "section": chunk.metadata.get("section", "Unknown"),
                "page_range": chunk.metadata.get("page_range", "Unknown"),
                "source_identifier": chunk.metadata.get("source_identifier", "Unknown")
            }
        }
        for chunk in chunks
    ]


def mask_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mask sensitive data in a dictionary.

    Args:
        data: Dictionary that may contain sensitive data

    Returns:
        Dictionary with sensitive fields masked
    """
    sensitive_fields = {"api_key", "secret", "password", "token", "key"}

    masked_data = {}
    for key, value in data.items():
        if key.lower() in sensitive_fields:
            masked_data[key] = "***MASKED***"
        elif isinstance(value, dict):
            masked_data[key] = mask_sensitive_data(value)
        else:
            masked_data[key] = value

    return masked_data