import { API_URL as ENV_API_URL } from '@env';

// API URL configuration - fallback to localhost if not defined in .env
export const API_URL = ENV_API_URL || 'http://localhost:8000';

// App configuration
export const APP_CONFIG = {
  appName: 'Task Manager',
  version: '1.0.0',
  theme: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#f5f5f5',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  },
};