from typing import List
from src.config.settings import settings
from src.models.entities import RetrievedChunk
from src.models.rag import RAGContext, RAGConfig
import logging

import logging
import re
from typing import Optional

# Try to import different LLM providers
try:
    import google.genai as genai
    logging.info("Using google.genai package for Gemini integration")
    GOOGLE_AVAILABLE = True
except Exception:
    try:
        import google.generativeai as genai
        logging.warning("google.generativeai is deprecated. Please migrate to google.genai")
        GOOGLE_AVAILABLE = True
    except Exception as e:
        genai = None
        GOOGLE_AVAILABLE = False
        logging.warning(f"Google Gemini libraries not available: {e}")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI library not available. Install with 'pip install openai'")

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    logging.warning("Anthropic library not available. Install with 'pip install anthropic'")

logger = logging.getLogger(__name__)


class GenerationService:
    def __init__(self):
        self.provider = settings.llm_provider.lower()
        self.model = None
        self.client = None

        # Initialize the appropriate LLM provider
        if self.provider == "gemini" and GOOGLE_AVAILABLE and settings.google_gemini_api_key:
            try:
                genai.configure(api_key=settings.google_gemini_api_key)
                self.model = genai.GenerativeModel(
                    model_name=settings.default_model or "gemini-2.0-flash",
                    generation_config={
                        "temperature": 0.1,
                        "max_output_tokens": 2048,
                        "top_p": 0.95,
                        "top_k": 40,
                    }
                )
                logger.info(f"Initialized Google Gemini with model: {settings.default_model or 'gemini-2.0-flash'}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini model: {e}")
        elif self.provider == "openai" and OPENAI_AVAILABLE and settings.openai_api_key:
            try:
                self.client = OpenAI(api_key=settings.openai_api_key)
                logger.info(f"Initialized OpenAI with model: {settings.default_model or 'gpt-3.5-turbo'}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        elif self.provider == "anthropic" and ANTHROPIC_AVAILABLE and settings.anthropic_api_key:
            try:
                self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
                logger.info(f"Initialized Anthropic with model: {settings.default_model or 'claude-3-haiku-20240307'}")
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")
        elif self.provider == "ollama":
            # Ollama uses local models, no API key needed
            try:
                from openai import OpenAI
                self.client = OpenAI(base_url=settings.ollama_base_url, api_key="ollama")
                logger.info(f"Initialized Ollama with model: {settings.default_model or 'llama2'}")
            except Exception as e:
                logger.warning(f"Failed to initialize Ollama client: {e}")
        elif self.provider == "openrouter" and settings.openrouter_api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=settings.openrouter_api_key)
                logger.info(f"Initialized OpenRouter with model: {settings.default_model or 'openai/gpt-3.5-turbo'}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenRouter client: {e}")
        else:
            logger.warning(f"LLM provider '{self.provider}' not properly configured or not supported. Using fallback strategies.")

        self.config = RAGConfig()

    def generate_response(self, rag_context: RAGContext, temperature: float = 0.1, max_tokens: int = 2048) -> str:
        """
        Generate a response based on the RAG context using the configured LLM provider.

        Args:
            rag_context: The RAG context containing query, retrieved chunks, etc.

        Returns:
            Generated response string
        """
        try:
            # Build the context from retrieved chunks
            context_text = self._build_context_text(rag_context.retrieved_chunks)

            # Create the prompt based on the mode
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
            elif rag_context.mode == "conversation":
                # General conversation mode - allow use of model's knowledge
                prompt = (
                    f"Please provide a helpful and engaging response to the following query: {rag_context.query}\n\n"
                    f"RESPONSE REQUIREMENTS:\n"
                    f"- Be friendly, helpful, and engaging\n"
                    f"- Provide accurate information to the best of your knowledge\n"
                    f"- If you're unsure about something, acknowledge the uncertainty\n"
                    f"- Keep the response concise but informative\n"
                    f"- Maintain a professional and positive tone"
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

            # Generate response using the configured LLM provider
            generated_text = self._call_llm_provider(prompt, temperature=temperature, max_tokens=max_tokens)

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
            # Ultimate fallback
            return "I don't have sufficient information in the provided context to answer this question accurately."

    def _call_llm_provider(self, prompt: str, temperature: float = 0.1, max_tokens: int = 2048) -> str:
        """
        Call the configured LLM provider to generate a response.

        Args:
            prompt: The prompt to send to the LLM
            temperature: Controls randomness in the response (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate

        Returns:
            Generated response string
        """
        if self.provider == "gemini" and self.model is not None:
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    },
                    safety_settings={
                        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
                        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                    }
                )
                if response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Google Gemini API error: {str(e)}")

        elif self.provider in ["openai", "ollama", "openrouter"] and self.client is not None:
            try:
                model = settings.default_model or "gpt-3.5-turbo"
                if self.provider == "ollama":
                    model = settings.default_model or "llama2"
                elif self.provider == "openrouter":
                    model = settings.default_model or "openai/gpt-3.5-turbo"

                response = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=0.95,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.warning(f"{self.provider.title()} API error: {str(e)}")

        elif self.provider == "anthropic" and self.client is not None:
            try:
                model = settings.default_model or "claude-3-haiku-20240307"
                response = self.client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system="You are a helpful AI assistant that answers questions based only on the provided context.",
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text.strip()
            except Exception as e:
                logger.warning(f"Anthropic API error: {str(e)}")

        # If no provider worked, use fallback
        logger.warning("No LLM provider available, using fallback response generation")
        return self._generate_fallback_response(prompt)

    def _generate_fallback_response(self, prompt: str) -> str:
        """
        Generate a fallback response when LLM providers are unavailable.

        Args:
            prompt: The original prompt

        Returns:
            Fallback response string
        """
        # Extract query from the prompt for fallback logic
        rag_context = prompt  # For simplicity in fallback, we'll use the full prompt
        # Check if we have context to work with
        if "Context from the book:" in prompt:
            context_part = prompt.split("Context from the book:")[1].split("Question to answer:")[0]
            query_part = prompt.split("Question to answer:")[1].split("\n")[0]

            if not context_part.strip():
                return "I don't have sufficient information in the provided context to answer this question accurately."

            # Simple fallback: extract relevant information from the context
            # Find sentences that are most relevant to the query by simple keyword matching
            import re
            query_words = set(re.findall(r'\w+', query_part.lower()))

            context_sentences = re.split(r'[.!?]+', context_part)
            relevant_sentences = []

            for sentence in context_sentences:
                sentence_lower = sentence.lower()
                sentence_words = set(re.findall(r'\w+', sentence_lower))
                # Count matching words between query and sentence
                matches = len(query_words.intersection(sentence_words))
                if matches > 0:
                    relevant_sentences.append((sentence.strip(), matches))

            # Sort by relevance (number of matching words)
            relevant_sentences.sort(key=lambda x: x[1], reverse=True)

            if relevant_sentences:
                # Take the most relevant sentences (up to 3)
                top_sentences = [sent[0] for sent in relevant_sentences[:3] if sent[0].strip()]
                if top_sentences:
                    fallback_response = f"Based on the course materials: {' '.join(top_sentences[:2])}."
                else:
                    fallback_response = "I don't have sufficient information in the provided context to answer this question accurately."
            else:
                fallback_response = "I don't have sufficient information in the provided context to answer this question accurately."
        else:
            fallback_response = "I don't have sufficient information in the provided context to answer this question accurately."

        return fallback_response

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