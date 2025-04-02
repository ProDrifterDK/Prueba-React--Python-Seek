'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { useTaskService, Task } from '../services/taskService';

interface TaskFormProps {
  onTaskAdded: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });
  const { createTask, loading } = useTaskService();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setErrors({ ...errors, title: false });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    setErrors({ ...errors, description: false });
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatus(e.target.value as Task['status']);
  };

  const validateForm = () => {
    const newErrors = {
      title: title.trim() === '',
      description: description.trim() === '',
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const newTask = await createTask({
        title,
        description,
        status,
      });
      
      setTitle('');
      setDescription('');
      setStatus('todo');
      
      onTaskAdded(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Add New Task
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Task Title"
            value={title}
            onChange={handleTitleChange}
            error={errors.title}
            helperText={errors.title ? 'Title is required' : ''}
            disabled={loading}
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
            helperText={errors.description ? 'Description is required' : ''}
            multiline
            rows={3}
            disabled={loading}
            required
          />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                value={status}
                label="Status"
                onChange={handleStatusChange}
                disabled={loading}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Task'}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default TaskForm;