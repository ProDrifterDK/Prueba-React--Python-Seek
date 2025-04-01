'use client';

import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  statusCounts: {
    todo: number;
    in_progress: number;
    completed: number;
  };
  totalTasks: number;
}

interface ErrorResponse {
  message?: string;
}

// Custom hook for task service
export const useTaskService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all tasks
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

  // Get task by ID
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

  // Create new task
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
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

  // Update task
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

  // Delete task
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

  // Get task statistics
  const getTaskStats = useCallback(async (): Promise<TaskStats> => {
    try {
      const tasks = await getTasks();
      
      // Count tasks by status
      const statusCounts = {
        todo: 0,
        in_progress: 0,
        completed: 0,
      };
      
      tasks.forEach(task => {
        if (statusCounts.hasOwnProperty(task.status)) {
          statusCounts[task.status]++;
        }
      });
      
      return {
        statusCounts,
        totalTasks: tasks.length,
      };
    } catch (err) {
      throw err;
    }
  }, [getTasks]);

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