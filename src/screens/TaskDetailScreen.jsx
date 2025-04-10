import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useTaskStore from '../lib/store';

/**
 * TaskDetailScreen component for viewing and managing task details
 */
const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { tasks, updateTask, deleteTask, setTaskStatus } = useTaskStore();
  
  // Find the task by ID
  const task = tasks.find(t => t.id === taskId);
  
  // Handle if task not found
  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return '#4361ee';
      case 'in-progress':
        return '#f8961e';
      case 'done':
        return '#4cc9f0';
      default:
        return '#6c757d';
    }
  };
  
  // Handle status change
  const handleStatusChange = (newStatus) => {
    setTaskStatus(task.id, newStatus);
  };
  
  // Handle delete task
  const handleDelete = () => {
    deleteTask(task.id);
    navigation.goBack();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: `${getStatusColor(task.status)}20` }
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
            {task.status === 'todo' ? 'To Do' : 
             task.status === 'in-progress' ? 'In Progress' : 'Done'}
          </Text>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Priority</Text>
            <Text style={styles.metaValue}>{task.priority}/5</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Importance</Text>
            <Text style={styles.metaValue}>{task.importance}/5</Text>
          </View>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(task.dueDate)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{task.category || 'None'}</Text>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.description}>
            {task.description || 'No description provided.'}
          </Text>
        </View>
        
        <View style={styles.statusActions}>
          <TouchableOpacity 
            style={[
              styles.statusButton,
              task.status === 'todo' && styles.statusButtonActive,
              { borderColor: '#4361ee' }
            ]}
            onPress={() => handleStatusChange('todo')}
          >
            <Text 
              style={[
                styles.statusButtonText,
                task.status === 'todo' && styles.statusButtonTextActive,
                { color: task.status === 'todo' ? '#fff' : '#4361ee' }
              ]}
            >
              To Do
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton,
              task.status === 'in-progress' && styles.statusButtonActive,
              { borderColor: '#f8961e' }
            ]}
            onPress={() => handleStatusChange('in-progress')}
          >
            <Text 
              style={[
                styles.statusButtonText,
                task.status === 'in-progress' && styles.statusButtonTextActive,
                { color: task.status === 'in-progress' ? '#fff' : '#f8961e' }
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton,
              task.status === 'done' && styles.statusButtonActive,
              { borderColor: '#4cc9f0' }
            ]}
            onPress={() => handleStatusChange('done')}
          >
            <Text 
              style={[
                styles.statusButtonText,
                task.status === 'done' && styles.statusButtonTextActive,
                { color: task.status === 'done' ? '#fff' : '#4cc9f0' }
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
          >
            <Text style={styles.editButtonText}>Edit Task</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#ffffff',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  backButtonText: {
    color: '#4361ee',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusButtonActive: {
    backgroundColor: '#4361ee',
  },
  statusButtonText: {
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#ffffff',
  },
  actions: {
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#f72585',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f72585',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#f72585',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});

export default TaskDetailScreen;
