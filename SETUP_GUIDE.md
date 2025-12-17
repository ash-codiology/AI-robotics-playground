# Setup Guide for RAG Chatbot with Google Gemini

## Overview
This project implements a RAG (Retrieval-Augmented Generation) chatbot that helps users interact with course content about Physical AI and Humanoid Robotics, now using Google Gemini API instead of Cohere.

## Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API Key

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following content:

```
GOOGLE_GEMINI_API_KEY=AIzaSyC-uWmfcVfB4xYTJKsH59c7LvgB82w9ELw
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_URL=your_qdrant_url_here
DATABASE_URL=sqlite:///./rag_chatbot.db
SECRET_KEY=your_secret_key_here
DEBUG=false
LOG_LEVEL=INFO
```

### 3. Start the Backend Server
```bash
python -m uvicorn src.api.main:app --reload --port 8000
```

Or using npm script:
```bash
npm run backend
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd book
npm install
```

### 2. Environment Variables (Optional)
If needed, create a `.env` file in the `book` directory:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 3. Start the Frontend
```bash
npx docusaurus start
```

Or using npm script:
```bash
npm run frontend
```

## Running Both Together
Use the main npm script to run both backend and frontend simultaneously:
```bash
npm run dev
```

## Troubleshooting

### Chatbot Not Opening
- Ensure the backend server is running on port 8000
- Check browser console for errors
- Verify the health check endpoint at `http://localhost:8000/api/v1/health`

### API Connection Issues
- Verify the Google Gemini API key is correctly set
- Ensure Qdrant is accessible (or using in-memory mode)
- Check CORS settings if accessing from different domain

### Embedding Issues
- The system will fall back to local sentence transformers if Google embeddings aren't available
- Make sure you have `sentence-transformers` installed for local embeddings