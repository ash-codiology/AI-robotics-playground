# Quickstart Guide: RAG Chatbot for Digital Book Readers

## Prerequisites
- Python 3.11+
- pip package manager
- Git
- Access to Cohere API
- Access to Qdrant Cloud
- Access to Neon Serverless Postgres

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root with the following:
```env
COHERE_API_KEY=your_cohere_api_key
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_URL=your_qdrant_url
NEON_DB_URL=your_neon_db_connection_string
SECRET_KEY=your_secret_key_for_auth
```

### 5. Run the Application
```bash
cd backend
uvicorn src.api.main:app --reload --port 8000
```

## API Usage

### Query Endpoint
```bash
POST /api/v1/query
Content-Type: application/json

{
  "query": "What does the book say about quantum computing?",
  "selected_text": null,
  "mode": "full_book"
}
```

### Selected Text Mode
```bash
POST /api/v1/query
Content-Type: application/json

{
  "query": "Explain this concept further",
  "selected_text": "The concept of quantum computing involves...",
  "mode": "selected_text"
}
```

## Development
- Run tests: `pytest`
- Format code: `black .`
- Lint code: `flake8`