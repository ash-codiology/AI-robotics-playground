import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { queryRAG, healthCheck } from '../../utils/api';
import { QueryRequest, ChatMessage, SourceMetadata } from '../../utils/types';
import styles from './FloatingRAGChatbot.module.css';

const FloatingRAGChatbot: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  // State for minimizing/maximizing the chat
  const [isMinimized, setIsMinimized] = useState(() => {
    // Load minimized state from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedMinimizedState = localStorage.getItem('chatbot-minimized');
      // If no saved state exists, default to false (expanded) for first-time users
      // This means the chat will be open by default
      return savedMinimizedState ? JSON.parse(savedMinimizedState) : false;
    }
    return false; // Default to expanded if not in browser environment
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load conversation history from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatbot-messages');
      if (savedMessages) {
        // Parse and convert timestamp strings back to Date objects
        const parsedMessages = JSON.parse(savedMessages);
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'full_book' | 'selected_text'>('full_book');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Convert Date objects to ISO strings for JSON serialization
      const serializableMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem('chatbot-messages', JSON.stringify(serializableMessages));
    }
  }, [messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check backend health on component mount with error handling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await healthCheck();
        setIsBackendHealthy(result.success);
        if (!result.success) {
          console.error('Backend health check failed:', result.error);
        }
      } catch (error) {
        console.error('Health check error:', error);
        setIsBackendHealthy(false);
      }
    };

    // Only perform health check after a short delay to ensure everything is loaded
    const healthCheckTimeout = setTimeout(() => {
      checkHealth();
    }, 1000);

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(healthCheckTimeout);
      clearInterval(interval);
    };
  }, []);

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


  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatbot-messages');
    }
  };

  const exportChat = (format: 'json' | 'text') => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    let content = '';
    let filename = '';

    if (format === 'json') {
      // Export as JSON with full message details
      content = JSON.stringify(messages, null, 2);
      filename = `chat-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    } else if (format === 'text') {
      // Export as plain text with user/assistant distinction
      content = messages
        .map(msg => {
          const time = msg.timestamp.toLocaleTimeString();
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `[${time}] ${role}: ${msg.content}`;
        })
        .join('\n\n');
      filename = `chat-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    }

    // Create and download the file
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Always visible chat window */}
      <div
        className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ''}`}
        ref={chatContainerRef}
        onClick={() => {
          // Toggle between minimized and expanded states when clicking the main container
          const newState = !isMinimized;
          setIsMinimized(newState);
          // Save the new state to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('chatbot-minimized', JSON.stringify(newState));
          }
        }} // Toggle between minimized and expanded states when clicking the main container
      >
        <div className={styles.chatHeader}>
          <h3>RAG Chatbot</h3>
          <div className={styles.headerActions}>
            <span className={`${styles.statusIndicator} ${isBackendHealthy ? styles.healthy : styles.unhealthy}`}>
              {isBackendHealthy ? '●' : '●'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                if (isMinimized) {
                  setIsMinimized(false);
                  // Save the new state to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('chatbot-minimized', JSON.stringify(false));
                  }
                } else {
                  exportChat('json');
                }
              }}
              className={styles.clearButton}
              title={isMinimized ? "Open Chat" : "Export as JSON"}
            >
              {isMinimized ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                if (isMinimized) {
                  setIsMinimized(false);
                  // Save the new state to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('chatbot-minimized', JSON.stringify(false));
                  }
                } else {
                  clearChat();
                }
              }}
              className={styles.clearButton}
              title={isMinimized ? "Open Chat" : "Clear chat"}
            >
              {isMinimized ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20C20.5523 7 21 7.44772 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 7.44772 3.44772 7 4 7Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {/* Minimize/Maximize button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                const newState = !isMinimized;
                setIsMinimized(newState);
                // Save the new state to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('chatbot-minimized', JSON.stringify(newState));
                }
              }}
              className={styles.clearButton}
              title={isMinimized ? "Expand Chat" : "Minimize Chat"}
            >
              {isMinimized ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 14V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H18C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17V9C20 8.46957 19.7893 7.96086 19.4142 7.58579C19.0391 7.21071 18.5304 7 18 7H16M4 14H10M4 14L8 10M4 14L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className={styles.chatBody}>
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
          </div> {/* End of modeSelector */}

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
          </div> {/* End of messagesContainer */}

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
      </div>
    </>
  );
};

export default FloatingRAGChatbot;





