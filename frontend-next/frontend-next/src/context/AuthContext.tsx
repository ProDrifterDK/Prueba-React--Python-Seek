'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

// Set default base URL for API requests
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<User>;
  register: (userData: { username: string; email: string; password: string }) => Promise<{ message: string; user_id: string }>;
  logout: () => void;
}

interface ErrorResponse {
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Logout function defined with useCallback to avoid dependency issues
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    router.push('/auth/login');
  }, [router]);

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadUser = async () => {
      if (token) {
        try {
          // Get user data from token
          const response = await axios.get('/auth/me');
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error loading user:', error);
          // If token is invalid, clear it
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, logout]);

  // Login function
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      return user;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      console.log('Registering user with data:', userData);
      console.log('API URL:', axios.defaults.baseURL);
      const response = await axios.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};