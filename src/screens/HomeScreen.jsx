import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import BubbleCanvas from '../components/BubbleCanvas';
import useTaskStore from '../lib/store';

/**
 * HomeScreen component for displaying the bubble visualization
 */
const HomeScreen = ({ navigation }) => {
  const { tasks, setTaskStatus } = useTaskStore();
  const [filter, setFilter] = useState('all');
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'done') return task.status === 'done';
    if (filter === 'high-priority') return task.priority >= 4;
    return true;
  });
  
  // Handle bubble press to view task details
  const handleBubblePress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };
  
  // Handle bubble long press for quick status change
  const handleBubbleLongPress = (task) => {
    // Cycle through statuses: todo -> in-progress -> done -> todo
    let newStatus;
    switch (task.status) {
      case 'todo':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'done';
        break;
      case 'done':
        newStatus = 'todo';
        break;
      default:
        newStatus = 'todo';
    }
    
    setTaskStatus(task.id, newStatus);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bubble Tasks</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <TouchableOpacity 
          style={[styles.filterItem, filter === 'all' && styles.filterItemActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterItem, filter === 'todo' && styles.filterItemActive]}
          onPress={() => setFilter('todo')}
        >
          <Text style={filter === 'todo' ? styles.filterTextActive : styles.filterText}>
            To Do
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterItem, filter === 'in-progress' && styles.filterItemActive]}
          onPress={() => setFilter('in-progress')}
        >
          <Text style={filter === 'in-progress' ? styles.filterTextActive : styles.filterText}>
            In Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterItem, filter === 'done' && styles.filterItemActive]}
          onPress={() => setFilter('done')}
        >
          <Text style={filter === 'done' ? styles.filterTextActive : styles.filterText}>
            Done
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterItem, filter === 'high-priority' && styles.filterItemActive]}
          onPress={() => setFilter('high-priority')}
        >
          <Text style={filter === 'high-priority' ? styles.filterTextActive : styles.filterText}>
            High Priority
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.canvasContainer}>
        <BubbleCanvas 
          tasks={filteredTasks}
          onBubblePress={handleBubblePress}
          onBubbleLongPress={handleBubbleLongPress}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('TaskForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4361ee',
  },
  filterBar: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterBarContent: {
    paddingHorizontal: 16,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterItemActive: {
    backgroundColor: '#4361ee',
  },
  filterText: {
    color: '#6c757d',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
