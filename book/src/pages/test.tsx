import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useUser } from '../contexts/UserContext';
import styles from './test.module.css';

const TestPage: React.FC = () => {
  const { user } = useUser();

  return (
    <Layout title="Test Page" description="Test page for all features">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>Feature Test Page</h1>
            <p>This page tests all the features implemented in the website.</p>

            <div className={styles.testSection}>
              <h2>User Authentication</h2>
              {user ? (
                <div>
                  <p>Logged in as: <strong>{user.name}</strong></p>
                  <p>Email: {user.email}</p>
                  {user.country && <p>Country: {user.country}</p>}
                  {user.bio && <p>Bio: {user.bio}</p>}
                  {user.interests && user.interests.length > 0 && (
                    <p>Interests: {user.interests.join(', ')}</p>
                  )}
                  {user.createdDate && <p>Member since: {new Date(user.createdDate).toLocaleDateString()}</p>}
                </div>
              ) : (
                <p>Not logged in. <Link to="/login">Go to login page</Link></p>
              )}
            </div>

            <div className={styles.testSection}>
              <h2>Navigation</h2>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/search">Search</Link></li>
                <li><Link to="/introduction">Introduction</Link></li>
              </ul>
            </div>

            <div className={styles.testSection}>
              <h2>Buttons</h2>
              <div className={styles.buttonGroup}>
                <Link className="button button--primary" to="/">Primary Button</Link>
                <Link className="button button--secondary" to="/">Secondary Button</Link>
                <Link className="button button--success" to="/">Success Button</Link>
              </div>
            </div>

            <div className={styles.testSection}>
              <h2>Responsive Grid</h2>
              <div className="row">
                <div className="col col--4">
                  <div className={styles.card}>Column 1</div>
                </div>
                <div className="col col--4">
                  <div className={styles.card}>Column 2</div>
                </div>
                <div className="col col--4">
                  <div className={styles.card}>Column 3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestPage;