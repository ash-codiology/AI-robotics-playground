import React, { useState, useRef, useEffect } from 'react';
import { queryRAG, healthCheck } from '../../utils/api';
import { QueryRequest, ChatMessage, SourceMetadata } from '../../utils/types';
import styles from './RAGChatbot.module.css';

interface RAGChatbotProps {
  initialMode?: 'full_book' | 'selected_text';
}

const RAGChatbot: React.FC<RAGChatbotProps> = ({ initialMode = 'full_book' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'full_book' | 'selected_text'>(initialMode);
  const [selectedText, setSelectedText] = useState('');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthCheck();
      setIsBackendHealthy(result.success);
      if (!result.success) {
        console.error('Backend health check failed:', result.error);
      }
    };

    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare the query request
      const queryRequest: QueryRequest = {
        query: input,
        mode: mode,
        ...(mode === 'selected_text' && selectedText && { selected_text: selectedText }),
      };

      // Call the backend API
      const result = await queryRAG(queryRequest);

      if (result.success && result.data) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: result.data.response,
          role: 'assistant',
          timestamp: new Date(),
          source_metadata: result.data.source_metadata,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          content: `Error: ${result.error || 'Failed to get response from RAG system'}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString();
      setSelectedText(text);
      setMode('selected_text');
      // Clear the selection
      selection.removeAllRanges();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>RAG Chatbot for Digital Book Readers</h3>
        <div className={styles.statusIndicator}>
          <span className={isBackendHealthy ? styles.healthy : styles.unhealthy}>
            {isBackendHealthy ? '●' : '●'} Backend: {isBackendHealthy ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className={styles.modeSelector}>
        <label>
          <input
            type="radio"
            checked={mode === 'full_book'}
            onChange={() => setMode('full_book')}
          />
          Full Book Mode
        </label>
        <label>
          <input
            type="radio"
            checked={mode === 'selected_text'}
            onChange={() => setMode('selected_text')}
          />
          Selected Text Mode
        </label>
      </div>

      {mode === 'selected_text' && selectedText && (
        <div className={styles.selectedTextPreview}>
          <strong>Selected Text:</strong>
          <p>"{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"</p>
          <button onClick={() => setSelectedText('')} className={styles.clearSelection}>
            Clear Selection
          </button>
        </div>
      )}

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <h4>Welcome to the RAG Chatbot!</h4>
            <p>
              I'm your AI assistant for the Physical AI & Humanoid Robotics Course.
              Ask me questions about the course content, and I'll provide answers based on the available documentation.
            </p>
            <p>
              <strong>Tip:</strong> Select text on the page and click anywhere to use "Selected Text Mode" for focused answers.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${styles[message.role]}`}
            >
              <div className={styles.messageContent}>
                {message.content}
              </div>
              {message.source_metadata && message.source_metadata.length > 0 && (
                <div className={styles.sourceAttribution}>
                  <details>
                    <summary>Sources</summary>
                    <ul>
                      {message.source_metadata.map((source, index) => (
                        <li key={index} className={styles.sourceItem}>
                          <div className={styles.sourceContent}>
                            {source.content.substring(0, 100)}
                            {source.content.length > 100 ? '...' : ''}
                          </div>
                          <div className={styles.sourceMetadata}>
                            Similarity: {(source.similarity_score * 100).toFixed(1)}%
                          </div>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className={styles.message} data-role="assistant">
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the course content..."
          disabled={isLoading}
          className={styles.inputField}
          rows={3}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className={styles.sendButton}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className={styles.chatActions}>
        <button onClick={clearChat} className={styles.clearButton}>
          Clear Chat
        </button>
        <button
          onClick={handleTextSelection}
          className={styles.selectTextButton}
          title="Select text on the page first, then click this button"
        >
          Use Selected Text
        </button>
      </div>
    </div>
  );
};

export default RAGChatbot;