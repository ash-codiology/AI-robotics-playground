import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  interests?: string[];
  country?: string;
  createdDate?: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = (userData: User) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(userData);
      setLoading(false);
      // Store user in localStorage to persist across page reloads
      localStorage.setItem('user', JSON.stringify(userData));
    }, 500);
  };

  const logout = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(null);
      setLoading(false);
      // Remove user from localStorage
      localStorage.removeItem('user');
    }, 300);
  };

  // Check for existing user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use logout from anywhere
export const useLogout = () => {
  const { logout } = useContext(UserContext);
  if (logout === undefined) {
    throw new Error('useLogout must be used within a UserProvider');
  }
  return logout;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};