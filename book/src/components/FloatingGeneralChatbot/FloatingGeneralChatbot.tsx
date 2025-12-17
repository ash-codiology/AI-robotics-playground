import React, { useState, useRef, useEffect } from 'react';
import { queryConversation, healthCheck } from '../../utils/api';
import { QueryRequest, ChatMessage } from '../../utils/types';
import styles from './FloatingGeneralChatbot.module.css';

const FloatingGeneralChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const isOpenRef = useRef(isOpen); // Keep track of current isOpen value
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Update the ref whenever isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Check backend health on component mount with error handling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await healthCheck();
        setIsBackendHealthy(result.success);
        if (!result.success) {
          console.warn('Backend health check failed:', result.error);
        }
      } catch (error) {
        console.warn('Health check error:', error);
        setIsBackendHealthy(false); // Mark as unhealthy if health check fails
      }
    };

    // Only perform health check after a short delay to ensure everything is loaded
    const healthCheckTimeout = setTimeout(() => {
      checkHealth();
    }, 1000);

    // Set up periodic health checks
    const interval = setInterval(async () => {
      try {
        const result = await healthCheck();
        // Only update if component is still mounted and result differs from current state
        setIsBackendHealthy(prev => result.success !== prev ? result.success : prev);
      } catch (error) {
        console.warn('Periodic health check failed:', error);
        // Only update if currently healthy (don't keep setting to false repeatedly)
        setIsBackendHealthy(prev => prev ? false : prev);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearTimeout(healthCheckTimeout);
      clearInterval(interval);
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.warn('Error scrolling to bottom:', error);
      // If smooth scrolling fails, try a simple scroll
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [messages]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node) && isOpenRef.current) {
          // Only close if the click is not on the toggle button
          const toggleButton = document.querySelector('[data-chatbot-toggle]');
          if (toggleButton && !toggleButton.contains(event.target as Node)) {
            setIsOpen(false);
            isOpenRef.current = false; // Update ref immediately
          }
        }
      } catch (error) {
        console.warn('Error handling click outside:', error);
        // If there's an error, still try to close the chat
        setIsOpen(false);
        isOpenRef.current = false;
      }
    };

    if (isOpenRef.current) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input length before sending to backend
    if (!input.trim()) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: Message cannot be empty`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (input.trim().length < 1) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: Message must be at least 1 character long`,
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
      // Prepare the query request for general conversation
      const queryRequest: QueryRequest = {
        query: input,
        mode: 'conversation', // Use conversation mode
      };

      // Call the backend API for general conversation
      const result = await queryConversation(queryRequest);

      if (result.success && result.data) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: result.data.response,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          content: `Error: ${result.error || 'Failed to get response from conversation system'}`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle network errors or other issues
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Error: ${error instanceof Error ? error.message : 'Connection failed. Please check your backend server.'}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const toggleChat = async () => {
    // Always allow toggling, regardless of backend health
    // This ensures the user can open/close the chat interface
    setIsOpen(prev => {
      const newValue = !prev;
      isOpenRef.current = newValue; // Update the ref immediately
      return newValue;
    });

    // If the chat is being opened and backend is unhealthy, try to re-check health in the background
    // Use the ref to get the current state
    if (!isOpenRef.current && !isBackendHealthy) {
      try {
        const result = await healthCheck();
        // Only update health status if the chat is still open (user didn't close it quickly)
        if (isOpenRef.current) {
          setIsBackendHealthy(result.success);
        }
      } catch (error) {
        // Don't update UI state if health check fails, just log the error
        console.warn('Health check failed when opening chat:', error);
        // Keep the existing health status to avoid UI flickering
      }
    }
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            <h3>Chat with Gemini</h3>
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

          {/* Remove mode selector since it's not needed for general conversation */}

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.welcomeMessage}>
                <p>Hello! I'm your AI assistant powered by Gemini.</p>
                <p>Ask me anything - I'm here to help with general conversation and questions.</p>
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
              placeholder="Type your message here..."
              disabled={isLoading}
              className={styles.inputField}
              rows={2}
            />
            <button type="submit" disabled={isLoading || !input.trim() || input.trim().length < 1} className={styles.sendButton}>
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

export default FloatingGeneralChatbot;