import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import TaskForm from '../components/TaskForm';
import useTaskStore from '../lib/store';

/**
 * TaskFormScreen component for adding or editing tasks
 */
const TaskFormScreen = ({ route, navigation }) => {
  const { taskId } = route.params || {};
  const { tasks, addTask, updateTask } = useTaskStore();
  
  // Find the task by ID if editing
  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  
  // Handle save task
  const handleSave = (taskData) => {
    if (taskId) {
      // Update existing task
      updateTask(taskId, taskData);
    } else {
      // Add new task
      addTask(taskData);
    }
    
    // Navigate back
    navigation.goBack();
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <TaskForm 
        task={task}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
});

export default TaskFormScreen;
