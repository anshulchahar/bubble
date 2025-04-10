import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import BubbleCanvas from '../components/BubbleCanvas';
import useTaskStore from '../lib/store';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { tasks, setTaskStatus } = useTaskStore();
  const [filter, setFilter] = useState('all');
  const { colors, isDark, setScheme } = useTheme();

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

  // Handle theme toggle with icon click
  const toggleTheme = () => {
    setScheme(isDark ? 'light' : 'dark');
  };

  // Get filter icon based on filter type
  const getFilterIcon = (filterType) => {
    switch(filterType) {
      case 'all': return 'apps';
      case 'todo': return 'list';
      case 'in-progress': return 'time';
      case 'done': return 'checkmark-circle';
      case 'high-priority': return 'alert-circle';
      default: return 'apps';
    }
  };

  // Dynamic styles based on theme
  const styles = getStyles(colors);

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'done') return task.status === 'done';
    if (filter === 'high-priority') return task.priority >= 4;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bubble Tasks</Text>
        {/* Replace toggle switch with just an icon */}
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDark ? "sunny" : "moon"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Compact Filter Bar with Icons */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContent}
        >
          {['all', 'todo', 'in-progress', 'done', 'high-priority'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterItem, filter === f && styles.filterItemActive]}
              onPress={() => setFilter(f)}
            >
              <Ionicons
                name={getFilterIcon(f)}
                size={18}
                color={filter === f ? colors.bubbleText : colors.textSecondary}
              />
              <Text style={[
                styles.filterText, 
                filter === f && styles.filterTextActive,
                {marginLeft: 4} // Small spacing between icon and text
              ]}>
                {f === 'all' ? 'All' : 
                 f === 'todo' ? 'Todo' : 
                 f === 'in-progress' ? 'In Progress' : 
                 f === 'done' ? 'Done' : 
                 'High Priority'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
    padding: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  themeToggle: {
    padding: 6,
    borderRadius: 20,
  },
  filterBar: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBarContent: {
    paddingHorizontal: 12,
  },
  filterItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  filterTextActive: {
    color: colors.bubbleText,
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;
