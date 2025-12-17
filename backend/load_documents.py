#!/usr/bin/env python3
"""
Script to load documentation files into the Qdrant vector database.
This script reads all markdown files from the book/docs directory and indexes them.
"""
import os
import re
from pathlib import Path
from typing import List, Dict, Any
import hashlib
import time

from src.services.retrieval import retrieval_service
from src.config.settings import settings


def extract_text_from_md(file_path: str) -> str:
    """Extract text content from a markdown file, removing markdown syntax."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove markdown headers, but keep the text
    # Remove headers like # Header, ## Header, etc.
    content = re.sub(r'^#+\s+', '', content, flags=re.MULTILINE)

    # Remove bold and italic markers
    content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
    content = re.sub(r'\*(.*?)\*', r'\1', content)
    content = re.sub(r'__(.*?)__', r'\1', content)
    content = re.sub(r'_(.*?)_', r'\1', content)

    # Remove links [text](url) -> text
    content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)

    # Remove images
    content = re.sub(r'!\[([^\]]*)\]\([^)]+\)', '', content)

    # Remove code blocks
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)

    # Remove inline code
    content = re.sub(r'`([^`]+)`', r'\1', content)

    # Remove extra whitespace
    content = re.sub(r'\n\s*\n', '\n\n', content)

    return content.strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks."""
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # If we're near the end, just take the rest
        if end >= len(text):
            chunks.append(text[start:])
            break

        # Try to break at sentence boundary
        chunk = text[start:end]
        last_period = chunk.rfind('.')
        last_space = chunk.rfind(' ')

        if last_period > chunk_size // 2:
            # Break at the last period if it's reasonably far in
            actual_end = start + last_period + 1
        elif last_space > chunk_size // 2:
            # Otherwise break at the last space
            actual_end = start + last_space
        else:
            # If no good break point, just break at chunk_size
            actual_end = end

        chunks.append(text[start:actual_end].strip())
        start = actual_end - overlap

        # Prevent infinite loops
        if start >= len(text):
            break
        if actual_end <= start:
            # If we're not advancing, take the next chunk_size characters
            chunks.append(text[start:start + chunk_size].strip())
            start += chunk_size

    # Filter out empty chunks
    return [chunk for chunk in chunks if chunk.strip()]


def get_all_md_files(docs_dir: str) -> List[str]:
    """Get all markdown files from the documentation directory."""
    md_files = []
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.lower().endswith('.md'):
                md_files.append(os.path.join(root, file))
    return md_files


def generate_content_id(content: str, source_path: str) -> str:
    """Generate a unique ID for content using UUID."""
    import uuid
    return str(uuid.uuid4())


def load_documents_to_qdrant():
    """Load all documentation files to Qdrant vector database."""
    print("Starting document loading process...")

    # Get all markdown files from the docs directory
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "book", "docs")
    if not os.path.exists(docs_dir):
        print(f"Error: Documentation directory not found at {docs_dir}")
        return False

    md_files = get_all_md_files(docs_dir)
    print(f"Found {len(md_files)} markdown files to process")

    if not md_files:
        print("No markdown files found to process")
        return False

    all_points_data = []

    for file_path in md_files:
        print(f"Processing file: {file_path}")

        try:
            # Extract text from markdown
            text_content = extract_text_from_md(file_path)

            # Skip empty files
            if not text_content.strip():
                print(f"  Skipping empty file: {file_path}")
                continue

            # Create chunks from the text
            chunks = chunk_text(text_content)
            print(f"  Created {len(chunks)} chunks from {file_path}")

            # Create point data for each chunk
            for i, chunk in enumerate(chunks):
                if chunk.strip():  # Only add non-empty chunks
                    content_id = generate_content_id(chunk, f"{file_path}_chunk_{i}")

                    # Extract relative path for metadata
                    relative_path = os.path.relpath(file_path, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

                    point_data = {
                        "id": content_id,
                        "content": chunk,
                        "metadata": {
                            "source_file": relative_path,
                            "chunk_index": i,
                            "total_chunks": len(chunks),
                            "file_path": file_path
                        }
                    }
                    all_points_data.append(point_data)
        except Exception as e:
            print(f"  Error processing file {file_path}: {str(e)}")
            continue

    print(f"Total chunks to index: {len(all_points_data)}")

    if not all_points_data:
        print("No content to index")
        return False

    # Batch add content to Qdrant
    try:
        print("Indexing content to Qdrant...")
        retrieval_service.batch_add_content(all_points_data)
        print(f"Successfully indexed {len(all_points_data)} content chunks to Qdrant")

        # Verify that the collection exists and has content
        try:
            # Try to get a count of points (if supported by the client)
            collection_info = retrieval_service.client.get_collection(retrieval_service.collection_name)
            print(f"Collection '{retrieval_service.collection_name}' has {collection_info.points_count} points")
        except Exception as e:
            print(f"Could not get collection info: {str(e)}")

        return True

    except Exception as e:
        print(f"Error indexing content to Qdrant: {str(e)}")
        return False


if __name__ == "__main__":
    print("Loading documents to Qdrant vector database...")
    print(f"Qdrant URL: {settings.qdrant_url}")

    success = load_documents_to_qdrant()

    if success:
        print("\nDocument loading completed successfully!")
        print("The RAG chatbot should now be able to respond to queries based on the documentation.")
    else:
        print("\nDocument loading failed!")
        print("Please check the above error messages and try again.")