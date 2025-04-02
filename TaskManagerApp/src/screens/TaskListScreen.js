import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, Text, Card, Title, Paragraph, Chip, Button, ActivityIndicator, Divider, Menu } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTaskService } from '../services/taskService';
import { useAuthService } from '../services/authService';
import { APP_CONFIG } from '../utils/config';

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { getTasks, updateTask, deleteTask, loading, error } = useTaskService();
  const { logout } = useAuthService();

  // Fetch tasks when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleAddTask = () => {
    navigation.navigate('TaskDetail', { mode: 'create' });
  };

  const handleEditTask = (task) => {
    navigation.navigate('TaskDetail', { mode: 'edit', task });
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              setTasks(tasks.filter(task => task.task_id !== taskId));
            } catch (error) {
              console.error('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      const updatedTask = await updateTask(task.task_id, { ...task, status: newStatus });
      setTasks(tasks.map(t => (t.task_id === updatedTask.task_id ? updatedTask : t)));
      setMenuVisible(false);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const openMenu = (task) => {
    setSelectedTask(task);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return APP_CONFIG.theme.error;
      case 'in_progress':
        return APP_CONFIG.theme.info;
      case 'completed':
        return APP_CONFIG.theme.success;
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter(task => task.status === statusFilter);

  const renderTaskItem = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>{item.title}</Title>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={{ borderColor: getStatusColor(item.status) }}
          >
            {getStatusLabel(item.status)}
          </Chip>
        </View>
        <Paragraph style={styles.cardDescription}>{item.description}</Paragraph>
      </Card.Content>
      <Divider />
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="text"
          onPress={() => handleEditTask(item)}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="pencil" size={size} color={color} />
          )}
          compact
        >
          Edit
        </Button>
        <Button
          mode="text"
          onPress={() => openMenu(item)}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="arrow-up-down" size={size} color={color} />
          )}
          compact
        >
          Status
        </Button>
        <Button
          mode="text"
          onPress={() => handleDeleteTask(item.task_id)}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="delete" size={size} color={color} />
          )}
          color={APP_CONFIG.theme.error}
          compact
        >
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Status filter chips */}
      <View style={styles.filterContainer}>
        <Chip
          selected={statusFilter === 'all'}
          onPress={() => setStatusFilter('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={statusFilter === 'todo'}
          onPress={() => setStatusFilter('todo')}
          style={styles.filterChip}
          selectedColor={APP_CONFIG.theme.error}
        >
          To Do
        </Chip>
        <Chip
          selected={statusFilter === 'in_progress'}
          onPress={() => setStatusFilter('in_progress')}
          style={styles.filterChip}
          selectedColor={APP_CONFIG.theme.info}
        >
          In Progress
        </Chip>
        <Chip
          selected={statusFilter === 'completed'}
          onPress={() => setStatusFilter('completed')}
          style={styles.filterChip}
          selectedColor={APP_CONFIG.theme.success}
        >
          Completed
        </Chip>
      </View>

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={APP_CONFIG.theme.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchTasks} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      )}

      {!loading && !error && filteredTasks.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks found</Text>
          <Button
            mode="contained"
            onPress={handleAddTask}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="plus" size={size} color={color} />
            )}
            style={styles.addButton}
          >
            Add Task
          </Button>
        </View>
      )}

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.task_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchTasks} />
        }
      />

      {/* Status change menu */}
      {selectedTask && (
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          <Menu.Item
            onPress={() => handleUpdateStatus(selectedTask, 'todo')}
            title="To Do"
            icon="checkbox-blank-circle-outline"
          />
          <Menu.Item
            onPress={() => handleUpdateStatus(selectedTask, 'in_progress')}
            title="In Progress"
            icon="progress-check"
          />
          <Menu.Item
            onPress={() => handleUpdateStatus(selectedTask, 'completed')}
            title="Completed"
            icon="check-circle-outline"
          />
        </Menu>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddTask}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.theme.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-around',
  },
  filterChip: {
    marginHorizontal: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  cardDescription: {
    color: '#666',
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: APP_CONFIG.theme.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: APP_CONFIG.theme.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    width: 150,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    width: 150,
  },
  menu: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -100,
    marginLeft: -100,
    width: 200,
  },
});

export default TaskListScreen;