# RAG Chatbot for Digital Book Readers - Full Stack Application

This is a full-stack application that combines a RAG (Retrieval-Augmented Generation) chatbot backend with a Docusaurus frontend for digital book readers, specifically designed for the Physical AI & Humanoid Robotics Course.

## Project Structure

- `backend/` - FastAPI backend with RAG functionality
- `book/` - Docusaurus frontend documentation site with chatbot interface
- `specs/` - Project specifications and documentation

## Features

- **Full Stack Integration**: Both frontend and backend can be run with a single command
- **RAG Chatbot**: AI-powered Q&A system that uses course content for responses
- **Floating Chat Interface**: Modern chatbot with a floating button at the bottom-left corner of every page
- **Slide-out Window**: Click the chat button to reveal a full chat interface that slides out from the side
- **Dual Modes**: Full-book mode and selected-text mode
- **Source Attribution**: Transparent source references for all answers
- **Modern UI**: Docusaurus-based documentation site with chatbot interface
- **Easy Development**: Single command to run both services

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   cd book && npm install && cd ..
   cd backend && pip install -r requirements.txt && cd ..
   ```

2. **Configure Backend** (required for full functionality):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys and connection strings
   ```

3. **Run Both Services**:
   ```bash
   npm start
   # or
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3006/AI-robotics-playground/
   - Backend API: http://localhost:8000/
   - Chatbot: Look for the floating chat button at the bottom-left corner of any page

## Scripts

- `npm start` - Run both frontend and backend in development mode (same as dev)
- `npm run dev` - Run both frontend and backend in development mode
- `npm run backend` - Run only the backend service
- `npm run frontend` - Run only the frontend service
- `npm run install` - Install dependencies for both frontend and backend
- `npm run test` - Run backend tests

## Chatbot Interface

The chatbot features a modern floating interface:
- A chat button appears at the bottom-left corner of every page
- Click the button to reveal a slide-out chat window
- The interface includes dual modes (full-book and selected-text)
- Source attribution shows where answers come from
- Fully responsive design works on all devices

## Configuration Requirements

To use the full RAG functionality, you need:

1. **Cohere API Key**: For language model access
2. **Qdrant API Key & URL**: For vector database storage
3. **Database URL**: For metadata storage

See `backend/.env.example` for required environment variables.

## Development

The application is designed for easy development with:

- Hot reloading for both frontend and backend
- Integrated error handling and debugging
- Comprehensive logging
- Health check endpoints

## Architecture

- **Frontend**: Docusaurus React-based documentation site
- **Backend**: FastAPI with Python
- **AI Model**: Cohere Command-R Plus
- **Vector Database**: Qdrant Cloud
- **Metadata Storage**: Postgres