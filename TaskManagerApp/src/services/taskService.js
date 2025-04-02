import { useState, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @typedef {Object} Task
 * @property {string} task_id - Task ID (updated from 'id' to match AWS API)
 * @property {string} user_id - User ID (added to match AWS API)
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {'todo' | 'in_progress' | 'completed'} status - Task status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} TaskStats
 * @property {number} total - Total number of tasks (updated to match AWS API)
 * @property {number} todo - Number of todo tasks
 * @property {number} in_progress - Number of in-progress tasks
 * @property {number} completed - Number of completed tasks
 */

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all tasks
   * @returns {Promise<Task[]>}
   */
  const getTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tasks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get task by ID
   * @param {string} taskId
   * @returns {Promise<Task>}
   */
  const getTaskById = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new task
   * @param {Object} taskData
   * @param {string} taskData.title
   * @param {string} taskData.description
   * @param {'todo' | 'in_progress' | 'completed'} taskData.status
   * @returns {Promise<Task>}
   */
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a task
   * @param {string} taskId
   * @param {Object} taskData
   * @returns {Promise<Task>}
   */
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a task
   * @param {string} taskId
   * @returns {Promise<boolean>}
   */
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/tasks/${taskId}`);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get task statistics
   * @returns {Promise<TaskStats>}
   */
  const getTaskStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the dedicated stats endpoint instead of calculating client-side
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch task statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats,
  };
};