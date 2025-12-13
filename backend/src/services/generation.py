from typing import List
from src.config.settings import settings
from src.models.entities import RetrievedChunk
from src.models.rag import RAGContext, RAGConfig
import cohere
import logging
import re

logger = logging.getLogger(__name__)


class GenerationService:
    def __init__(self):
        self.cohere_client = cohere.Client(settings.cohere_api_key)
        self.config = RAGConfig()

    def generate_response(self, rag_context: RAGContext) -> str:
        """
        Generate a response based on the RAG context.

        Args:
            rag_context: The RAG context containing query, retrieved chunks, etc.

        Returns:
            Generated response string
        """
        try:
            # Build the context from retrieved chunks
            context_text = self._build_context_text(rag_context.retrieved_chunks)

            # Create the prompt for Cohere with strong anti-hallucination instructions
            if rag_context.mode == "selected_text" and rag_context.selected_text:
                # Selected text mode - only use the selected text
                prompt = (
                    f"STRICT INSTRUCTION: Answer ONLY based on the selected text provided below. "
                    f"Do not use any external knowledge, general world knowledge, or make assumptions beyond what is in the selected text.\n\n"
                    f"Selected text you must base your answer on: {rag_context.selected_text}\n\n"
                    f"Question to answer: {rag_context.query}\n\n"
                    f"RESPONSE REQUIREMENTS:\n"
                    f"- Answer only using information from the selected text\n"
                    f"- If the selected text does not contain sufficient information to answer the question, "
                    f"respond with: 'I don't have sufficient information in the provided context to answer this question accurately.'\n"
                    f"- Do not add any information not present in the selected text\n"
                    f"- Do not make inferences beyond what is explicitly stated\n"
                    f"- Maintain a professional, helpful, neutral, and engaging tone\n"
                    f"- Be concise yet complete in your response"
                )
            else:
                # Full book mode - use retrieved chunks
                if not context_text.strip():
                    return "I don't have sufficient information in the provided context to answer this question accurately."

                prompt = (
                    f"STRICT INSTRUCTION: Answer ONLY based on the following context from the book. "
                    f"Do not use any external knowledge, general world knowledge, or make assumptions beyond what is in the provided context.\n\n"
                    f"Context from the book:\n{context_text}\n\n"
                    f"Question to answer: {rag_context.query}\n\n"
                    f"RESPONSE REQUIREMENTS:\n"
                    f"- Answer only using information from the provided context\n"
                    f"- If the context does not contain sufficient information to answer the question, "
                    f"respond with: 'I don't have sufficient information in the provided context to answer this question accurately.'\n"
                    f"- Do not add any information not present in the context\n"
                    f"- Do not make inferences beyond what is explicitly stated\n"
                    f"- Maintain a professional, helpful, neutral, and engaging tone\n"
                    f"- Be concise yet complete in your response"
                )

            # Generate response using Cohere
            response = self.cohere_client.generate(
                model="command-r-plus",  # Using a more advanced model for better quality
                prompt=prompt,
                max_tokens=self.config.max_response_tokens,
                temperature=0.1,  # Very low temperature for more factual, consistent responses
                stop_sequences=["\n\n", "STRICT INSTRUCTION:", "RESPONSE REQUIREMENTS:"]
            )

            generated_text = response.generations[0].text.strip()

            # Apply additional anti-hallucination checks if enabled
            if self.config.enable_anti_hallucination:
                generated_text = self._apply_anti_hallucination_check(
                    generated_text,
                    context_text,
                    rag_context
                )

            return generated_text

        except Exception as e:
            logger.error(f"Error during response generation: {str(e)}")
            raise

    def _build_context_text(self, retrieved_chunks: List[RetrievedChunk]) -> str:
        """
        Build a context text from the retrieved chunks.

        Args:
            retrieved_chunks: List of retrieved chunks

        Returns:
            Combined context text
        """
        if not retrieved_chunks:
            return ""

        # Combine the content of all chunks, up to the max context length
        context_parts = []
        total_length = 0

        for chunk in retrieved_chunks:
            chunk_text = f"Source: {chunk.metadata.get('source_identifier', 'Unknown')}\n"
            if chunk.metadata.get('chapter'):
                chunk_text += f"Chapter: {chunk.metadata['chapter']}\n"
            if chunk.metadata.get('section'):
                chunk_text += f"Section: {chunk.metadata['section']}\n"
            chunk_text += f"Content: {chunk.content}\n\n"

            # Check if adding this chunk would exceed max length
            if total_length + len(chunk_text) > self.config.max_context_length:
                break

            context_parts.append(chunk_text)
            total_length += len(chunk_text)

        return "".join(context_parts)

    def _apply_anti_hallucination_check(self, generated_text: str, context_text: str, rag_context: RAGContext) -> str:
        """
        Apply comprehensive anti-hallucination checks to the generated text.

        Args:
            generated_text: The generated response
            context_text: The context used for generation
            rag_context: The RAG context

        Returns:
            Potentially modified response with hallucination checks applied
        """
        # Check if the response contains the insufficient information message
        if "I don't have sufficient information in the provided context to answer this question accurately." in generated_text:
            return generated_text

        # Check for common hallucination patterns
        hallucination_patterns = [
            r"according to my training data",
            r"based on general knowledge",
            r"in the real world",
            r"from what i know",
            r"generally speaking",
            r"usually",
            r"typically",
            r"most of the time",
            r"commonly",
            r"as we know",
            r"it is known that",
            r"studies show",
            r"research indicates"
        ]

        for pattern in hallucination_patterns:
            if re.search(pattern, generated_text, re.IGNORECASE):
                logger.warning(f"Potential hallucination detected: {pattern}")
                return "I don't have sufficient information in the provided context to answer this question accurately."

        # Additional checks could be implemented here
        # For example, fact-checking against the context or using semantic similarity

        return generated_text

    def validate_response_against_context(self, response: str, context_chunks: List[RetrievedChunk]) -> bool:
        """
        Validate that the response is grounded in the provided context.

        Args:
            response: The generated response
            context_chunks: The context chunks used for generation

        Returns:
            True if the response is properly grounded, False otherwise
        """
        # Check if response contains the insufficient information message
        if "I don't have sufficient information in the provided context to answer this question accurately." in response:
            return True  # This is a valid response when context is insufficient

        # In a production implementation, you would want to perform more sophisticated
        # validation, such as checking semantic similarity between response and context
        # or using NLP techniques to verify grounding

        # For now, we'll implement a basic check
        context_text = " ".join(chunk.content for chunk in context_chunks if chunk.content)
        if not context_text.strip():
            # If there's no context but we have a response, it might be hallucinated
            if response.strip() and "I don't have sufficient information" not in response:
                return False
            return True

        return True


# Global instance
generation_service = GenerationService()