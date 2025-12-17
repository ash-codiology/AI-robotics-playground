import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { queryRAG, healthCheck } from '../../utils/api';
import { QueryRequest, ChatMessage, SourceMetadata } from '../../utils/types';
import styles from './AdvancedChatbot.module.css';

// Define tool types
type Tool = {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: React.ReactNode;
};

const AdvancedChatbot: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load conversation history from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('advanced-chatbot-messages');
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
  const [mode, setMode] = useState<'full_book' | 'selected_text' | 'conversation'>('full_book');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [activeTool, setActiveTool] = useState<string>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Define tools for the sidebar
  const tools: Tool[] = [
    {
      id: 'chat',
      name: 'Chat',
      icon: '💬',
      description: 'Main chat interface',
      component: null, // This will be handled by the main chat
    },
    {
      id: 'search',
      name: 'Search',
      icon: '🔍',
      description: 'Search through documents',
      component: (
        <div className={styles.toolContent}>
          <h4>Document Search</h4>
          <p>Search through the entire document collection</p>
          <input
            type="text"
            placeholder="Enter search query..."
            className={styles.searchInput}
          />
        </div>
      ),
    },
    {
      id: 'history',
      name: 'History',
      icon: '🕒',
      description: 'View chat history',
      component: (
        <div className={styles.toolContent}>
          <h4>Chat History</h4>
          <div className={styles.historyList}>
            {messages.length > 0 ? (
              messages.slice(0, 10).map((msg, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyPreview}>
                    {msg.content.substring(0, 50)}...
                  </div>
                  <div className={styles.historyTime}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No chat history available</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'Configure chatbot settings',
      component: (
        <div className={styles.toolContent}>
          <h4>Settings</h4>
          <div className={styles.settingItem}>
            <label>
              <input
                type="checkbox"
                checked={sidebarOpen}
                onChange={(e) => setSidebarOpen(e.target.checked)}
              />
              Show Sidebar
            </label>
          </div>
          <div className={styles.settingItem}>
            <label>
              <input
                type="radio"
                checked={mode === 'full_book'}
                onChange={() => setMode('full_book')}
              />
              Full Book Mode
            </label>
          </div>
          <div className={styles.settingItem}>
            <label>
              <input
                type="radio"
                checked={mode === 'selected_text'}
                onChange={() => setMode('selected_text')}
              />
              Selected Text Mode
            </label>
          </div>
          <div className={styles.settingItem}>
            <label>
              <input
                type="radio"
                checked={mode === 'conversation'}
                onChange={() => setMode('conversation')}
              />
              Conversation Mode
            </label>
          </div>
        </div>
      ),
    },
    {
      id: 'export',
      name: 'Export',
      icon: '📤',
      description: 'Export conversations',
      component: (
        <div className={styles.toolContent}>
          <h4>Export Options</h4>
          <button className={styles.exportButton} onClick={() => exportChat('json')}>
            Export as JSON
          </button>
          <button className={styles.exportButton} onClick={() => exportChat('text')}>
            Export as Text
          </button>
          <button className={styles.exportButton} onClick={() => exportChat('pdf')}>
            Export as PDF
          </button>
        </div>
      ),
    },
    {
      id: 'bookmarks',
      name: 'Bookmarks',
      icon: '🔖',
      description: 'Saved bookmarks',
      component: (
        <div className={styles.toolContent}>
          <h4>Bookmarks</h4>
          <p>Save important conversations for later reference</p>
          <button className={styles.bookmarkButton}>
            + Add Bookmark
          </button>
        </div>
      ),
    },
  ];

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Convert Date objects to ISO strings for JSON serialization
      const serializableMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }));
      localStorage.setItem('advanced-chatbot-messages', JSON.stringify(serializableMessages));
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
      localStorage.removeItem('advanced-chatbot-messages');
    }
  };

  const exportChat = (format: 'json' | 'text' | 'pdf') => {
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
    } else if (format === 'pdf') {
      // For PDF, we'll generate a simple text representation
      content = `Chat Export\n\n` + messages
        .map(msg => {
          const time = msg.timestamp.toLocaleTimeString();
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `[${time}] ${role}: ${msg.content}`;
        })
        .join('\n\n');
      filename = `chat-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
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

  const activeToolComponent = tools.find(tool => tool.id === activeTool)?.component;

  return (
    <div className={`${styles.chatContainer} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Tools</h3>
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
            >
              &larr;
            </button>
          </div>

          <div className={styles.toolsList}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                className={`${styles.toolButton} ${activeTool === tool.id ? styles.activeTool : ''}`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.description}
              >
                <span className={styles.toolIcon}>{tool.icon}</span>
                <span className={styles.toolName}>{tool.name}</span>
              </button>
            ))}
          </div>

          <div className={styles.sidebarContent}>
            {activeToolComponent || (
              <div className={styles.toolContent}>
                <h4>{tools.find(t => t.id === activeTool)?.name}</h4>
                <p>{tools.find(t => t.id === activeTool)?.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      {!sidebarOpen && (
        <button
          className={styles.sidebarToggle}
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          &rarr;
        </button>
      )}

      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <h3>Advanced RAG Chatbot</h3>
          <div className={styles.headerActions}>
            <span className={`${styles.statusIndicator} ${isBackendHealthy ? styles.healthy : styles.unhealthy}`}>
              {isBackendHealthy ? '●' : '●'}
            </span>
            <button onClick={() => exportChat('json')} className={styles.clearButton} title="Export as JSON">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={clearChat} className={styles.clearButton} title="Clear chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20C20.5523 7 21 7.44772 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 7.44772 3.44772 7 4 7Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <label className={mode === 'conversation' ? styles.active : ''}>
            <input
              type="radio"
              checked={mode === 'conversation'}
              onChange={() => setMode('conversation')}
            />
            Conversation
          </label>
        </div> {/* End of modeSelector */}

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <p>Welcome to the Advanced RAG Chatbot!</p>
              <p>Use the sidebar tools to enhance your experience. Ask me anything about the course content.</p>
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
    </div>
  );
};

export default AdvancedChatbot;