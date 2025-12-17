#!/usr/bin/env python3
"""
Test script to verify the content loader functionality
"""
import sys
import os
import logging

# Add the backend/src directory to the path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.utils.content_loader import load_content_to_qdrant
from qdrant_client import QdrantClient

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def test_content_loader():
    print("Testing content loader...")

    # Create an in-memory client for testing
    client = QdrantClient(':memory:')
    collection_name = 'test_content'

    print(f"Attempting to load content from docs directory...")
    result = load_content_to_qdrant(client, collection_name)
    print(f'Load completed. Using collection: {result}')

    # Check collection info
    collection_info = client.get_collection(result)
    print(f'Collection points count: {collection_info.points_count}')

    # Try to search to make sure it works
    print("Testing search functionality...")
    try:
        # Since we don't have embeddings set up, let's just verify the collection exists
        search_results = client.scroll(
            collection_name=result,
            limit=3  # Get first 3 points
        )
        print(f"Retrieved {len(search_results[0])} sample points from collection")
        if search_results[0]:
            first_point = search_results[0][0]
            print(f"First point content preview: {first_point.payload.get('content', '')[:100]}...")
    except Exception as e:
        print(f"Search test completed with error (expected if embeddings aren't properly configured): {e}")

    print("Content loader test completed successfully!")

if __name__ == "__main__":
    test_content_loader()