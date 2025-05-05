import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import BubbleCanvas from '../components/BubbleCanvas';
import useTaskStore from '../lib/store';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { tasks, setTaskStatus, fetchTasks, isLoading } = useTaskStore();
  const [filter, setFilter] = useState('all');
  const { colors, isDark, setScheme } = useTheme();
  const { user, signOut } = useAuth();

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

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

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", onPress: signOut, style: "destructive" }
      ]
    );
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
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          {/* User greeting and profile */}
          <TouchableOpacity style={styles.userInfo} onPress={handleSignOut}>
            <Text style={styles.userGreeting}>Hi, {user?.email?.split('@')[0] || 'User'}</Text>
            <Ionicons name="log-out-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          
          {/* Theme toggle */}
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your tasks...</Text>
          </View>
        ) : filteredTasks.length > 0 ? (
          <BubbleCanvas
            tasks={filteredTasks}
            onBubblePress={handleBubblePress}
            onBubbleLongPress={handleBubbleLongPress}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-outline" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first task
            </Text>
          </View>
        )}
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
    paddingLeft: 0, // Remove left padding completely
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 35,
    width: 120,
    marginLeft: -25, // Add negative margin to pull logo closer to edge
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userGreeting: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginRight: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: '80%',
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
