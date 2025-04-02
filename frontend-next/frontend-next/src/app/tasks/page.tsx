'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import TaskItem from '../../components/TaskItem';
import TaskForm from '../../components/TaskForm';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTaskService, Task } from '../../services/taskService';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#ffebee' },
  { id: 'in_progress', title: 'In Progress', color: '#e3f2fd' },
  { id: 'completed', title: 'Completed', color: '#e8f5e9' },
];

const taskAnimationStyles = {
  task: {
    opacity: 1,
    transform: 'scale(1)',
    transition: 'all 0.5s ease-in-out',
  },
  enter: {
    opacity: 0,
    transform: 'scale(0.8)',
  },
  exit: {
    opacity: 0,
    transform: 'scale(0.8)',
  },
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const { getTasks, loading, error } = useTaskService();

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load tasks. Please try again.',
        severity: 'error',
      });
    }
  }, [getTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskAdded = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setSnackbar({
      open: true,
      message: 'Task added successfully!',
      severity: 'success',
    });
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.task_id === updatedTask.task_id ? updatedTask : task))
    );
    setSnackbar({
      open: true,
      message: 'Task updated successfully!',
      severity: 'success',
    });
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    setSnackbar({
      open: true,
      message: 'Task deleted successfully!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Task Management
          </Typography>

          <TaskForm onTaskAdded={handleTaskAdded} />

          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Your Tasks
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : tasks.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tasks found. Add your first task above!
            </Alert>
          ) : (
            <Box sx={{ mt: 4 }}>
              {/* Kanban Board */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2
                }}
              >
                {COLUMNS.map(column => (
                  <Box 
                    key={column.id} 
                    sx={{ 
                      flex: 1,
                      width: { xs: '100%', md: '33.33%' }
                    }}
                  >
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        backgroundColor: column.color,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}
                      >
                        {column.title} ({getTasksByStatus(column.id).length})
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          flexGrow: 1,
                          minHeight: '500px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}
                      >
                        {getTasksByStatus(column.id).length === 0 ? (
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              height: '100%',
                              opacity: 0.5
                            }}
                          >
                            <Typography>No tasks in this column</Typography>
                          </Box>
                        ) : (
                          getTasksByStatus(column.id).map((task, index) => (
                            <Box
                              key={`${task.task_id}-${task.status}`}
                              sx={{
                                ...taskAnimationStyles.task,
                                animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s both`,
                                '@keyframes fadeIn': {
                                  '0%': {
                                    opacity: 0,
                                    transform: 'translateY(20px) scale(0.9)',
                                  },
                                  '100%': {
                                    opacity: 1,
                                    transform: 'translateY(0) scale(1)',
                                  },
                                },
                              }}
                            >
                              <TaskItem
                                task={task}
                                onTaskUpdated={handleTaskUpdated}
                                onTaskDeleted={handleTaskDeleted}
                              />
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
}