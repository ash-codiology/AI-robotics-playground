# Backend Setup Instructions

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
GOOGLE_GEMINI_API_KEY=AIzaSyC-uWmfcVfB4xYTJKsH59c7LvgB82w9ELw
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_URL=your_qdrant_url_here
DATABASE_URL=sqlite:///./rag_chatbot.db
SECRET_KEY=your_secret_key_here
DEBUG=false
LOG_LEVEL=INFO
```

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Start the backend server:
```bash
python -m uvicorn src.api.main:app --reload
```

The backend will be available at `http://localhost:8000`.