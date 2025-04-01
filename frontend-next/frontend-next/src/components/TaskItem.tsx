'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  SelectChangeEvent,
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
  const { updateTask, deleteTask } = useTaskService();

  const handleStatusChange = async (event: SelectChangeEvent) => {
    const newStatus = event.target.value as Task['status'];
    setStatus(newStatus);
    
    try {
      const updatedTask = await updateTask(task.id, { ...task, status: newStatus });
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert to original status on error
      setStatus(task.status);
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
      await deleteTask(task.id);
      onTaskDeleted(task.id);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Define colors for different statuses
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return '#ffebee'; // Light red
      case 'in_progress':
        return '#e3f2fd'; // Light blue
      case 'completed':
        return '#e8f5e9'; // Light green
      default:
        return '#ffffff'; // White
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2, 
          backgroundColor: getStatusColor(status),
          transition: 'background-color 0.3s ease'
        }}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {task.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id={`status-label-${task.id}`}>Status</InputLabel>
              <Select
                labelId={`status-label-${task.id}`}
                id={`status-select-${task.id}`}
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            color="error" 
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </CardActions>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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