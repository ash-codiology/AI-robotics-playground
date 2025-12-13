from typing import Optional
from pydantic import BaseModel, validator
from src.models.entities import QueryRequest
import logging

logger = logging.getLogger(__name__)


class QueryValidator:
    """Utility class for validating query requests."""

    @staticmethod
    def validate_query_request(request: QueryRequest) -> bool:
        """
        Validate a query request.

        Args:
            request: The QueryRequest to validate

        Returns:
            True if valid, raises ValueError if invalid
        """
        # Check that query is not empty or just whitespace
        if not request.query or not request.query.strip():
            raise ValueError("Query cannot be empty")

        # Check query length
        if len(request.query.strip()) < 3:
            raise ValueError("Query must be at least 3 characters long")

        # Check maximum query length
        if len(request.query) > 1000:
            raise ValueError("Query exceeds maximum length of 1000 characters")

        # Validate mode if provided
        if request.mode and request.mode not in ['full_book', 'selected_text']:
            raise ValueError("Mode must be either 'full_book' or 'selected_text'")

        # If selected_text is provided, validate it
        if request.selected_text is not None:
            if len(request.selected_text.strip()) < 1:
                raise ValueError("Selected text cannot be empty if provided")
            if len(request.selected_text) > 5000:
                raise ValueError("Selected text exceeds maximum length of 5000 characters")

        # If mode is selected_text, ensure selected_text is provided
        if request.mode == 'selected_text' and (not request.selected_text or not request.selected_text.strip()):
            raise ValueError("Selected text must be provided when mode is 'selected_text'")

        return True

    @staticmethod
    def validate_selected_text_content(selected_text: str) -> bool:
        """
        Validate the content of selected text to ensure it's appropriate for processing.

        Args:
            selected_text: The selected text to validate

        Returns:
            True if valid, raises ValueError if invalid
        """
        if not selected_text or not selected_text.strip():
            raise ValueError("Selected text cannot be empty")

        # Check for minimum length
        if len(selected_text.strip()) < 5:
            raise ValueError("Selected text is too short to be meaningful (minimum 5 characters)")

        # Check for excessive repetition (potential spam/malicious input)
        # This is a basic check - in production, you'd want more sophisticated validation
        if len(set(selected_text.split())) < len(selected_text.split()) * 0.1:  # If >90% of words are duplicates
            raise ValueError("Selected text appears to contain excessive repetition")

        return True

    @staticmethod
    def sanitize_query(query: str) -> str:
        """
        Sanitize a query string.

        Args:
            query: The query string to sanitize

        Returns:
            Sanitized query string
        """
        if not query:
            return query

        # Strip leading/trailing whitespace
        sanitized = query.strip()

        # Additional sanitization could be added here
        # For example, removing potentially harmful characters or patterns
        # (though with LLMs, be careful not to remove legitimate punctuation)

        return sanitized

    @staticmethod
    def validate_selected_text_mode_consistency(request: QueryRequest) -> bool:
        """
        Validate consistency between mode and selected_text.

        Args:
            request: The QueryRequest to validate

        Returns:
            True if consistent, raises ValueError if inconsistent
        """
        if request.mode == 'selected_text':
            if not request.selected_text or not request.selected_text.strip():
                raise ValueError("Selected text is required when mode is 'selected_text'")

        return True


def validate_and_sanitize_request(request: QueryRequest) -> QueryRequest:
    """
    Validate and sanitize a query request.

    Args:
        request: The QueryRequest to validate and sanitize

    Returns:
        The validated and sanitized QueryRequest

    Raises:
        ValueError: If the request is invalid
    """
    # Validate the request
    QueryValidator.validate_query_request(request)
    QueryValidator.validate_selected_text_mode_consistency(request)

    # Additional validation for selected text content if in selected text mode
    if request.mode == 'selected_text' and request.selected_text:
        QueryValidator.validate_selected_text_content(request.selected_text)

    # Sanitize the query
    request.query = QueryValidator.sanitize_query(request.query)

    # Sanitize selected text if present
    if request.selected_text:
        request.selected_text = QueryValidator.sanitize_query(request.selected_text)

    return request