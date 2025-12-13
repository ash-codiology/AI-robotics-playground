import React, { useState, useRef, useEffect } from 'react';
import { queryRAG, healthCheck } from '../../utils/api';
import { QueryRequest, ChatMessage, SourceMetadata } from '../../utils/types';
import styles from './FloatingRAGChatbot.module.css';

const FloatingRAGChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'full_book' | 'selected_text'>('full_book');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node) && isOpen) {
        // Only close if the click is not on the toggle button
        const toggleButton = document.querySelector('[data-chatbot-toggle]');
        if (toggleButton && !toggleButton.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input length before sending to backend
    if (!input.trim()) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: Query cannot be empty`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (input.trim().length < 3) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: Query must be at least 3 characters long`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (isLoading) return;

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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        data-chatbot-toggle
        onClick={toggleChat}
        className={`${styles.chatToggleButton} ${isOpen ? styles.open : ''}`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 14.2565 20.2141 16.4552 18.7777 18.3036C18.3676 18.8103 17.7127 19.0807 17.117 18.9944L14.2857 18.5714C13.0903 18.3986 11.855 18.3986 10.6597 18.5714L7.82838 18.9944C7.2327 19.0807 6.5778 18.8103 6.16769 18.3036C4.7313 16.4552 3.94544 14.2565 3.94544 12C3.94544 7.58172 7.58172 3.94544 12 3.94544C16.4183 3.94544 20.0546 7.58172 20.0546 12Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isBackendHealthy ? null : (
          <span className={styles.statusIndicator}></span>
        )}
      </button>

      {/* Chat window - only render when open */}
      {isOpen && (
        <div className={styles.chatWindow} ref={chatContainerRef}>
          <div className={styles.chatHeader}>
            <h3>RAG Chatbot</h3>
            <div className={styles.headerActions}>
              <span className={`${styles.statusIndicator} ${isBackendHealthy ? styles.healthy : styles.unhealthy}`}>
                {isBackendHealthy ? '●' : '●'}
              </span>
              <button onClick={clearChat} className={styles.clearButton} title="Clear chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20C20.5523 7 21 7.44772 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 7.44772 3.44772 7 4 7Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={toggleChat} className={styles.closeButton} title="Close chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.modeSelector}>
            <label className={mode === 'full_book' ? styles.active : ''}>
              <input
                type="radio"
                checked={mode === 'full_book'}
                onChange={() => setMode('full_book')}
              />
              Full Book
            </label>
            <label className={mode === 'selected_text' ? styles.active : ''}>
              <input
                type="radio"
                checked={mode === 'selected_text'}
                onChange={() => setMode('selected_text')}
              />
              Selected Text
            </label>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <p>Ask me anything about the Physical AI & Humanoid Robotics Course!</p>
                <p>I'll provide answers based on the course content with proper citations.</p>
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
              rows={2}
            />
            <button type="submit" disabled={isLoading || !input.trim() || input.trim().length < 3} className={styles.sendButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingRAGChatbot;