import React, { Component, Suspense } from 'react';
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import UserBanner from '../components/UserBanner/UserBanner';

// Create a suspense-aware and error-boundary-safe chatbot component
const LazyFloatingRAGChatbot = React.lazy(() =>
  import('../components/FloatingRAGChatbot/FloatingRAGChatbot').catch(() => ({
    default: () => (
      <button
        onClick={() => window.location.reload()}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Greenish-blue gradient for RAG chat
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          fontSize: '24px',
          border: '2px solid white'
        }}
        title="RAG Chatbot failed to load - click to refresh"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#dc3545',
          border: '2px solid white'
        }}></span>
      </button>
    )
  }))
);

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChatbotErrorBoundary extends Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('FloatingGeneralChatbot error:', error, errorInfo);
    // Log to error reporting service in production
    // Example: Sentry.captureException(error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render a minimal chatbot button even if there's an error
      return (
        <button
          onClick={() => window.location.reload()}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', // Green for general chat
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            fontSize: '24px',
            border: '2px solid white'
          }}
          title="Chatbot failed to load - click to refresh"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#dc3545',
            border: '2px solid white'
          }}></span>
        </button>
      );
    }

    return this.props.children;
  }
}

function Root({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <UserBanner />
        {children}
        <ChatbotErrorBoundary>
          <Suspense fallback={null}>
            <LazyFloatingRAGChatbot />
          </Suspense>
        </ChatbotErrorBoundary>
      </UserProvider>
    </ThemeProvider>
  );
}

export default Root;