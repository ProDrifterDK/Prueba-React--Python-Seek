'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ButtonGroup,
} from '@mui/material';
import { useTaskService, Task } from '../services/taskService';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { updateTask, deleteTask } = useTaskService();
  const prevStatusRef = useRef(task.status);

  useEffect(() => {
    if (prevStatusRef.current !== task.status) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    prevStatusRef.current = task.status;
  }, [task.status]);

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (newStatus === status) return;
    
    setStatus(newStatus);
    setIsAnimating(true);
    
    try {
      const updatedTask = await updateTask(task.task_id, { ...task, status: newStatus });
      onTaskUpdated(updatedTask);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    } catch (error) {
      console.error('Error updating task status:', error);
      setStatus(task.status);
      setIsAnimating(false);
    }
  };

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.task_id);
      onTaskDeleted(task.task_id);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: 3,
          },
          animation: isAnimating ? 'pulse 0.5s ease-in-out' : 'none',
        }}
        className={isAnimating ? 'task-update' : ''}
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
            {task.description}
          </Typography>
          
          {/* Status buttons and delete button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonGroup 
              size="small" 
              variant="outlined"
              sx={{ 
                '& .MuiButtonGroup-grouped': {
                  minWidth: '40px',
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                  borderRadius: '4px !important',
                },
                height: '28px',
                '& .MuiButton-root': {
                  textTransform: 'none',
                  fontWeight: status === 'todo' || status === 'in_progress' || status === 'completed' ? 'bold' : 'normal',
                }
              }}
            >
              <Button 
                onClick={() => handleStatusChange('todo')}
                variant={status === 'todo' ? 'contained' : 'outlined'}
                color={status === 'todo' ? 'error' : 'inherit'}
                sx={{ 
                  borderColor: status === 'todo' ? 'error.main' : 'divider',
                  '&:hover': { borderColor: 'error.main', backgroundColor: 'error.light' }
                }}
              >
                To Do
              </Button>
              <Button 
                onClick={() => handleStatusChange('in_progress')}
                variant={status === 'in_progress' ? 'contained' : 'outlined'}
                color={status === 'in_progress' ? 'primary' : 'inherit'}
                sx={{ 
                  borderColor: status === 'in_progress' ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.light' }
                }}
              >
                In Progress
              </Button>
              <Button 
                onClick={() => handleStatusChange('completed')}
                variant={status === 'completed' ? 'contained' : 'outlined'}
                color={status === 'completed' ? 'success' : 'inherit'}
                sx={{ 
                  borderColor: status === 'completed' ? 'success.main' : 'divider',
                  '&:hover': { borderColor: 'success.main', backgroundColor: 'success.light' }
                }}
              >
                Done
              </Button>
            </ButtonGroup>
            
            <Button 
              size="small" 
              color="error" 
              onClick={handleDeleteClick}
              sx={{ 
                minWidth: 'auto',
                px: 1,
                fontSize: '0.75rem',
                height: '28px',
                textTransform: 'none'
              }}
            >
              Delete
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        container={document.body}
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Task"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskItem;