#!/usr/bin/env python3
"""
Test script to verify the RAG system works end-to-end
"""
import sys
import os
import logging

# Add the backend/src directory to the path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.models.rag import RAGRequest
from src.services.rag_engine import rag_engine_service

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def test_rag_system():
    print("Testing RAG system...")

    # Create a sample query
    request = RAGRequest(
        query="What is ROS 2 and how does it differ from ROS 1?",
        mode="full_book"
    )

    print(f"Processing query: {request.query}")

    try:
        # Process the query using the RAG engine
        response = rag_engine_service.process_query(request)

        print(f"Response: {response.response[:200]}...")
        print(f"Number of source chunks: {len(response.source_chunks)}")
        print(f"Confidence score: {response.confidence_score}")

        if response.source_chunks:
            print(f"First source chunk preview: {response.source_chunks[0].content[:100]}...")

        print("RAG system test completed successfully!")
        return True

    except Exception as e:
        print(f"Error during RAG processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_rag_system()
    if success:
        print("\nRAG system is working correctly!")
    else:
        print("\nRAG system test failed!")
        sys.exit(1)