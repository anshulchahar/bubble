import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import TaskForm from '../components/TaskForm';
import Sidebar from '../components/Sidebar';
import useTaskStore from '../lib/store';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const TaskFormScreen = ({ route, navigation }) => {
  // Safely extract taskId from route.params, ensuring it doesn't error if params is undefined
  const taskId = route.params?.taskId;
  const { tasks, addTask, updateTask } = useTaskStore();
  const { colors } = useTheme(); // Use theme colors
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Find the task by ID if editing
  const task = taskId ? tasks.find(t => t.id === taskId) : null;

  // Handle save task
  const handleSave = (taskData) => {
    if (taskId) {
      updateTask(taskId, taskData);
    } else {
      addTask(taskData);
    }
    navigation.goBack();
  };

  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar Component */}
      <Sidebar 
        isVisible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
      
      <TaskForm
        task={task}
        onSave={handleSave}
        onCancel={handleCancel}
        onMenuPress={() => setSidebarVisible(true)}
      />
    </SafeAreaView>
  );
};

// Minimal styles here, most styling is in TaskForm component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TaskFormScreen;
