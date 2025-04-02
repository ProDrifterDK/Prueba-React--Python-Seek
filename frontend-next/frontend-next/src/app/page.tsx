'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Assignment as TaskIcon, BarChart as ChartIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/tasks');
    }
  }, [isAuthenticated, router]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Task Management System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A comprehensive solution for managing your team&apos;s tasks efficiently.
          Create, update, and track tasks with ease.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <TaskIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Manage Tasks
          </Typography>
          <Typography variant="body1" paragraph>
            Create, update, and delete tasks with an intuitive interface.
            Organize tasks by status: To Do, In Progress, and Completed.
          </Typography>
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/auth/login')}
            >
              Get Started
            </Button>
          </Box>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <ChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Visualize Progress
          </Typography>
          <Typography variant="body1" paragraph>
            Track your team&apos;s progress with interactive charts and statistics.
            Get insights into task distribution and completion rates.
          </Typography>
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/auth/login')}
            >
              View Charts
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to get started?
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mx: 1 }}
            onClick={() => router.push('/auth/login')}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ mx: 1 }}
            onClick={() => router.push('/auth/register')}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
