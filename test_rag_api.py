import requests
import json

# Test the RAG chatbot API
def test_rag_chatbot():
    # Backend URL
    api_url = "http://localhost:8000/api/v1/query"

    # Sample query
    query_data = {
        "query": "What is the main topic of this course?",
        "mode": "full_book"
    }

    print("Testing RAG Chatbot API...")
    print(f"Sending query: {query_data['query']}")

    try:
        response = requests.post(
            api_url,
            json=query_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"Response status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result['response'][:100]}...")
            print(f"Source metadata count: {len(result.get('source_metadata', []))}")
            print("RAG Chatbot API test: PASSED")
        else:
            print(f"RAG Chatbot API test: FAILED - Status {response.status_code}")
            print(f"Error: {response.text}")

    except Exception as e:
        print(f"RAG Chatbot API test: FAILED - Error {str(e)}")

if __name__ == "__main__":
    test_rag_chatbot()