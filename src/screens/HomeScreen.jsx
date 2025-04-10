import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import BubbleCanvas from '../components/BubbleCanvas';
import useTaskStore from '../lib/store';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { Ionicons } from '@expo/vector-icons'; // For a modern plus icon

const HomeScreen = ({ navigation }) => {
  const { tasks, setTaskStatus } = useTaskStore();
  const [filter, setFilter] = useState('all');
  const { colors, isDark } = useTheme(); // Use theme colors and mode

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
    let newStatus;
    switch (task.status) {
      case 'todo': newStatus = 'in-progress'; break;
      case 'in-progress': newStatus = 'done'; break;
      case 'done': newStatus = 'todo'; break;
      default: newStatus = 'todo';
    }
    setTaskStatus(task.id, newStatus);
  };

  // Dynamic styles based on theme
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bubble Tasks</Text>
        {/* Optional: Add a theme toggle button later */}
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {[ 'all', 'todo', 'in-progress', 'done', 'high-priority' ].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterItem, filter === f && styles.filterItemActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f ? styles.filterTextActive : styles.filterText}>
              {f.replace('-', ' ').replace(/\w/g, l => l.toUpperCase())} {/* Prettier labels */}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bubble Canvas */}
      <View style={styles.canvasContainer}>
        <BubbleCanvas
          tasks={filteredTasks}
          onBubblePress={handleBubblePress}
          onBubbleLongPress={handleBubbleLongPress}
        />
      </View>

      {/* Modern Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TaskForm')}
      >
        <Ionicons name="add" size={32} color={colors.bubbleText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Function to generate styles based on theme colors
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use theme background
  },
  header: {
    backgroundColor: colors.card, // Use theme card color
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Use theme border color
  },
  headerTitle: {
    fontSize: 24, // Slightly larger title
    fontWeight: 'bold',
    color: colors.text, // Use theme text color
  },
  filterBar: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  filterBarContent: {
    paddingHorizontal: 16,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // More rounded
    marginRight: 10,
    backgroundColor: colors.background, // Use theme background for inactive
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterItemActive: {
    backgroundColor: colors.primary, // Use primary color for active
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary, // Use secondary text color
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.bubbleText, // Use light text on primary background
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: colors.card, // Use card color
    borderRadius: 12, // Slightly more rounded
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32, // Adjusted position
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary, // Use primary color
    justifyContent: 'center',
    alignItems: 'center',
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  // addButtonText (removed, using icon now)
});

export default HomeScreen;
