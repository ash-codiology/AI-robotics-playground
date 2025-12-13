## Running the Application

To run both the frontend and backend together with a single command:

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start both servers** with a single command:
   ```bash
   npm start
   # or
   npm run dev
   ```

This will start:
- **Backend API** on `http://localhost:8000`
- **Frontend Docusaurus** on `http://localhost:3006`

The chatbot is already positioned as a floating button at the bottom-left corner of every page and features a slide-out interface when clicked.

### Environment Variables

Make sure you have the required environment variables in your `backend/.env` file:
- `COHERE_API_KEY` - Your Cohere API key for embeddings
- `QDRANT_API_KEY` and `QDRANT_URL` - Qdrant vector database credentials
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - Secret key for authentication

### Troubleshooting

If the chatbot doesn't respond:
1. Verify that the backend server is running on port 8000
2. Check that all required environment variables are set in the backend/.env file
3. Verify that your Cohere and Qdrant credentials are valid
4. Check browser console and backend logs for any error messages