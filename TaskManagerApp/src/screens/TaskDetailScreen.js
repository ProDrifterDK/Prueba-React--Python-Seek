import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Surface, RadioButton } from 'react-native-paper';
import { useTaskService } from '../services/taskService';
import { APP_CONFIG } from '../utils/config';

const TaskDetailScreen = ({ navigation, route }) => {
  const { mode, task } = route.params || { mode: 'create' };
  const isEditMode = mode === 'edit';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const { createTask, updateTask, loading, error } = useTaskService();

  useEffect(() => {
    if (isEditMode && task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [isEditMode, task]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the task');
      return;
    }

    try {
      if (isEditMode) {
        await updateTask(task.id, {
          title,
          description,
          status,
        });
        Alert.alert('Success', 'Task updated successfully');
      } else {
        await createTask({
          title,
          description,
          status,
        });
        Alert.alert('Success', 'Task created successfully');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      // Error is handled by the useTaskService hook
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Surface style={styles.surface}>
          <Title style={styles.title}>
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </Title>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={4}
            mode="outlined"
          />
          
          <Text style={styles.label}>Status</Text>
          
          <RadioButton.Group onValueChange={value => setStatus(value)} value={status}>
            <View style={styles.radioItem}>
              <RadioButton value="todo" color={APP_CONFIG.theme.error} />
              <Text style={styles.radioLabel}>To Do</Text>
            </View>
            
            <View style={styles.radioItem}>
              <RadioButton value="in_progress" color={APP_CONFIG.theme.info} />
              <Text style={styles.radioLabel}>In Progress</Text>
            </View>
            
            <View style={styles.radioItem}>
              <RadioButton value="completed" color={APP_CONFIG.theme.success} />
              <Text style={styles.radioLabel}>Completed</Text>
            </View>
          </RadioButton.Group>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.theme.background,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: APP_CONFIG.theme.primary,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  errorText: {
    color: APP_CONFIG.theme.error,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default TaskDetailScreen;