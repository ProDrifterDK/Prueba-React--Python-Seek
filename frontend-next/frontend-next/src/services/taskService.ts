'use client';

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

export interface Task {
  task_id: string;  // Updated from 'id' to 'task_id' to match AWS API
  user_id?: string; // Added to match AWS API
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;     // Updated to match AWS API
  todo: number;
  in_progress: number;
  completed: number;
}

interface ErrorResponse {
  message?: string;
}

export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async (): Promise<Task[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/tasks');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTaskById = useCallback(async (taskId: string): Promise<Task> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/tasks/${taskId}`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to fetch task';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: Omit<Task, 'task_id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/tasks', taskData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/tasks/${taskId}`);
      return true;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTaskStats = useCallback(async (): Promise<TaskStats> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the dedicated stats endpoint instead of calculating client-side
      const response = await axios.get('/tasks/stats');
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to fetch task statistics';
      setError(errorMessage);
      throw error;
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