import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import useTaskStore from '../lib/store';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { Ionicons } from '@expo/vector-icons'; // For icons

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { tasks, updateTask, deleteTask, setTaskStatus } = useTaskStore();
  const { colors } = useTheme(); // Use theme colors

  // Find the task by ID
  const task = tasks.find(t => t.id === taskId);

  // Dynamic styles based on theme
  const styles = getStyles(colors);

  // Handle if task not found
  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredContent}>
            <Text style={styles.errorText}>Task not found</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { // Use device locale
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status display info (color and text)
  const getStatusInfo = (status) => {
    switch (status) {
      case 'todo':
        return { color: colors.bubbleTodo.split(' ')[2], text: 'To Do' }; // Extract end color from gradient
      case 'in-progress':
        return { color: colors.bubbleInProgress.split(' ')[2], text: 'In Progress' };
      case 'done':
        return { color: colors.bubbleDone.split(' ')[2], text: 'Done' };
      default:
        return { color: colors.bubbleDefault, text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(task.status);

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Title */}
          <Text style={styles.title}>{task.title}</Text>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              // Use a semi-transparent version of the status color
              { backgroundColor: `${statusInfo.color}33` } // Add alpha transparency
            ]}
          >
            <Text style={[styles.statusText, { color: colors.primary }]}>
              {statusInfo.text}
            </Text>
          </View>

          {/* Meta Info Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority</Text>
              <Text style={styles.metaValue}>{task.priority}/5</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Importance</Text>
              <Text style={styles.metaValue}>{task.importance}/5</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDate(task.dueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{task.category || 'None'}</Text>
            </View>
          </View>

          {/* Description */}
          {task.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}

          {/* Status Change Buttons */}
          <View style={styles.sectionContainer}>
             <Text style={styles.sectionLabel}>Change Status</Text>
             <View style={styles.statusActions}>
                {[ 'todo', 'in-progress', 'done' ].map((statusValue) => {
                  const currentStatusInfo = getStatusInfo(statusValue);
                  const isActive = task.status === statusValue;
                  return (
                    <TouchableOpacity
                      key={statusValue}
                      style={[
                        styles.statusButton
                        // Removed the active background color style
                      ]}
                      onPress={() => handleStatusChange(statusValue)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: isActive ? colors.primary : colors.text }
                        ]}
                      >
                        {currentStatusInfo.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
            >
              <Ionicons name="create-outline" size={20} color={colors.bubbleText} style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Edit Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.bubbleText} style={styles.buttonIcon} />
              <Text style={styles.actionButtonText}>Delete Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Function to generate styles based on theme colors
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16, // Reduce top padding inside safe area
    paddingBottom: 8,
    backgroundColor: colors.background, // Match background
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 20,
    // Consistent shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0, // Removed horizontal padding completely
    paddingVertical: 6,
    marginLeft: 0, // Ensure no left margin
    borderRadius: 16,
    marginBottom: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10, // Reduced margin
  },
  metaItem: {
    width: '50%', // Two items per row
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
   descriptionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600', // Bolder section label
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary, // Slightly lighter description text
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.text, // Use text color which will be black in light mode and white in dark mode
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  // statusButtonActive is handled inline now
  statusButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  // statusButtonTextActive is handled inline now
  actions: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14, // Larger buttons
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: colors.bubbleText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.bubbleTodo.split(' ')[2], // Use theme red color
  },
  deleteButtonText: {
    color: colors.bubbleTodo.split(' ')[2],
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default TaskDetailScreen;
