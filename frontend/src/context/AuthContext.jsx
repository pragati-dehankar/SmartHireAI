import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role, company) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/register', { name, email, password, role, company });
      const { user, token } = response.data;
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}