'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useTaskService, TaskStats } from '../../services/taskService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskChart() {
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const { getTaskStats, loading, error } = useTaskService();

  const fetchTaskStats = useCallback(async () => {
    try {
      const stats = await getTaskStats();
      setTaskStats(stats);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  }, [getTaskStats]);

  useEffect(() => {
    fetchTaskStats();
  }, [fetchTaskStats]);

  const getPieChartData = () => {
    if (!taskStats) return null;
    
    return {
      labels: ['To Do', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [
            taskStats.statusCounts.todo,
            taskStats.statusCounts.in_progress,
            taskStats.statusCounts.completed,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const getDoughnutData = () => {
    if (!taskStats) return null;
    
    return {
      labels: ['Completed', 'Not Completed'],
      datasets: [
        {
          data: [
            taskStats.statusCounts.completed,
            taskStats.statusCounts.todo + taskStats.statusCounts.in_progress,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(201, 203, 207, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(201, 203, 207, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Task Statistics
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : !taskStats || taskStats.totalTasks === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No tasks found. Add some tasks to see statistics.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Tasks by Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  {getPieChartData() && <Pie data={getPieChartData()!} options={chartOptions} />}
                </Box>
              </Paper>
              
              <Paper elevation={3} sx={{ p: 3, flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Task Completion
                </Typography>
                <Box sx={{ height: 300 }}>
                  {getDoughnutData() && <Doughnut data={getDoughnutData()!} options={chartOptions} />}
                </Box>
              </Paper>
            </Box>
          )}
          
          {taskStats && taskStats.totalTasks > 0 && (
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, 
                gap: 2 
              }}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                  }}
                >
                  <Typography variant="h4">
                    {taskStats.statusCounts.todo}
                  </Typography>
                  <Typography variant="body2">To Do</Typography>
                </Paper>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                  }}
                >
                  <Typography variant="h4">
                    {taskStats.statusCounts.in_progress}
                  </Typography>
                  <Typography variant="body2">In Progress</Typography>
                </Paper>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                  }}
                >
                  <Typography variant="h4">
                    {taskStats.statusCounts.completed}
                  </Typography>
                  <Typography variant="body2">Completed</Typography>
                </Paper>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                  }}
                >
                  <Typography variant="h4">
                    {taskStats.totalTasks}
                  </Typography>
                  <Typography variant="body2">Total Tasks</Typography>
                </Paper>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </ProtectedRoute>
  );
}