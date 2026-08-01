import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we've checked for an existing session

  // On first load, if a token exists in localStorage, verify it against /auth/me
  // and restore the user session — otherwise a page refresh would silently log
  // the user out even though their token is still valid.
  useEffect(() => {
    const token = localStorage.getItem('learnium_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // token invalid/expired — clear it so we don't keep retrying
        localStorage.removeItem('learnium_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('learnium_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('learnium_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}