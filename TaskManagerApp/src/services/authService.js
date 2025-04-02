import { useState, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

export const useAuthService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * Register a new user
   * @param {Object} userData
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.password
   * @returns {Promise<Object>}
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login a user
   * @param {Object} credentials
   * @param {string} credentials.username
   * @param {string} credentials.password
   * @returns {Promise<Object>}
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user_id } = response.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user_id', user_id);
      
      setIsAuthenticated(true);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout the current user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_id');
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, []);

  /**
   * Get the current user's information
   * @returns {Promise<Object>}
   */
  const getCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return null;
      }
      
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get user information';
      setError(errorMessage);
      
      // If unauthorized, clear token and set as not authenticated
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user_id');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if the user is authenticated
   * @returns {Promise<boolean>}
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return false;
      }
      
      await getCurrentUser();
      return isAuthenticated;
    } catch (err) {
      setIsAuthenticated(false);
      return false;
    }
  }, [getCurrentUser, isAuthenticated]);

  return {
    loading,
    error,
    isAuthenticated,
    user,
    register,
    login,
    logout,
    getCurrentUser,
    checkAuth,
  };
};