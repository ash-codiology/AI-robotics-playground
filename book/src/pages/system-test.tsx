import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './test.module.css';

const SystemTestPage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [frontendStatus, setFrontendStatus] = useState<'online' | 'offline'>('online');
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/health');
        if (response.ok) {
          setBackendStatus('online');
          const data = await response.json();
          setApiResponse(`Health check: ${data.status}`);
        } else {
          setBackendStatus('offline');
          setApiResponse('Backend is not responding');
        }
      } catch (error) {
        setBackendStatus('offline');
        setApiResponse('Error connecting to backend: ' + (error as Error).message);
      }
    };

    checkBackend();
  }, []);

  return (
    <Layout title="System Test" description="Test page for backend and frontend integration">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>System Integration Test</h1>

            <div className={styles.testSection}>
              <h2>System Status</h2>
              <div className={styles.statusGrid}>
                <div className={`${styles.statusCard} ${styles[frontendStatus]}`}>
                  <h3>Frontend</h3>
                  <p>Status: <strong>{frontendStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</strong></p>
                  <p>Location: Docusaurus site running on localhost</p>
                </div>

                <div className={`${styles.statusCard} ${backendStatus}`}>
                  <h3>Backend</h3>
                  <p>Status: <strong>{backendStatus === 'checking' ? 'CHECKING...' : backendStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</strong></p>
                  <p>Location: FastAPI server on port 8000</p>
                </div>
              </div>
            </div>

            <div className={styles.testSection}>
              <h2>API Response</h2>
              <div className={styles.apiResponse}>
                {apiResponse ? (
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <p>Checking backend connection...</p>
                )}
              </div>
            </div>

            <div className={styles.testSection}>
              <h2>Configuration Requirements</h2>
              <p>To fully use the RAG Chatbot functionality, you need to configure the backend with proper credentials:</p>
              <ul>
                <li><strong>Cohere API Key</strong>: Required for language model</li>
                <li><strong>Qdrant API Key & URL</strong>: Required for vector database</li>
                <li><strong>Database URL</strong>: Required for metadata storage</li>
              </ul>

              <h3>Setup Instructions:</h3>
              <ol>
                <li>Copy <code>backend/.env.example</code> to <code>backend/.env</code></li>
                <li>Add your API keys and connection strings</li>
                <li>Ensure your vector database contains the course content</li>
                <li>Restart the backend service</li>
              </ol>
            </div>

            <div className={styles.testSection}>
              <h2>Quick Start</h2>
              <p>Both frontend and backend services are configured to run together with:</p>
              <code>npm run dev</code>
              <p>This command starts both services simultaneously using concurrently.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SystemTestPage;