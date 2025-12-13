import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useUser } from '../contexts/UserContext';
import Link from '@docusaurus/Link';
import styles from './login.module.css';

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    interests?: string[];
    country?: string;
    createdDate?: string;
  };
  token: string;
  message: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [country, setCountry] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginUser, loading } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match during signup
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const url = isSignUp
        ? 'http://localhost:8000/api/v1/auth/register'
        : 'http://localhost:8000/api/v1/auth/login';

      const requestBody = isSignUp
        ? {
            name,
            email,
            password,
            bio: bio || undefined,
            interests: interests ? interests.split(',').map(item => item.trim()) : undefined,
            country: country || undefined
          }
        : { email, password };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isSignUp ? 'Registration failed' : 'Login failed'));
      }

      if (data.success && data.user) {
        // Store the token in localStorage for API authentication
        localStorage.setItem('auth_token', data.token);
        // Login the user in the context
        loginUser(data.user);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // For Google login, we would typically redirect to a Google OAuth endpoint
      // For now, we'll simulate with a simple login
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'googleuser@example.com',
          password: 'google_login_temp_password' // In real implementation, use OAuth token
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      if (data.success && data.user) {
        localStorage.setItem('auth_token', data.token);
        loginUser(data.user);
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during Google login');
    }
  };

  return (
    <Layout title="Login" description="Login to access the Physical AI course">
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h1>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
          <p className={styles.subtitle}>
            {isSignUp
              ? 'Create an account to access the course content'
              : 'Sign in to continue learning'}
          </p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {isSignUp && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                    <option value="BR">Brazil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="bio">Bio (Optional)</label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={3}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="interests">Areas of Interest (comma separated)</label>
                  <input
                    type="text"
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., robotics, AI, machine learning, computer vision"
                  />
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className={styles.googleIcon}>
              <path
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </button>

          <div className={styles.toggleAuth}>
            <p>
              {isSignUp
                ? 'Already have an account?'
                : 'Don\'t have an account?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={styles.toggleButton}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className={styles.footer}>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;