import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const TaskBubble = ({ task, onPress, onLongPress, style }) => {
  const { colors } = useTheme(); // Use theme colors

  // Calculate bubble size based on priority and importance (keep consistent)
  const getBubbleRadius = (priority, importance) => {
    const base = 30; // min size
    const maxAdd = 50; // max extra size
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };

  // Get bubble gradient colors based on status
  const getBubbleGradient = (status) => {
    switch (status) {
      case 'todo':
        // Extract colors from CSS gradient string
        return ['#FF9A8B', '#FF6A88'];
      case 'in-progress':
        return ['#FFD54F', '#FFBF3A'];
      case 'done':
        return ['#81FBB8', '#28C76F'];
      default:
        return [colors.bubbleDefault, colors.bubbleDefault]; // Use solid color for default
    }
  };

  const radius = getBubbleRadius(task.priority, task.importance);
  const gradientColors = getBubbleGradient(task.status);
  const isDefaultColor = task.status !== 'todo' && task.status !== 'in-progress' && task.status !== 'done';

  // Dynamic styles
  const dynamicStyles = getStyles(radius, colors);

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      onLongPress={() => onLongPress(task)}
      style={[dynamicStyles.container, style]} // Combine base styles with position styles
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        style={dynamicStyles.gradient}
        start={{ x: 0, y: 0 }} // Define gradient direction
        end={{ x: 1, y: 1 }}
      >
        <View style={dynamicStyles.labelContainer}>
          <Text style={dynamicStyles.label} numberOfLines={Math.floor(radius / 10)}> {/* Adjust lines based on size */}
            {task.title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Function to generate styles
const getStyles = (radius, colors) => StyleSheet.create({
  container: {
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius, // Make it a circle
    overflow: 'hidden', // Clip gradient to circle
    // Add a subtle shadow/border for better definition
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: colors.card, // Background for shadow to show
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    padding: 5, // Consistent padding
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.bubbleText, // Use theme text color for bubbles
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.max(10, Math.min(14, radius * 0.3)), // Scale font size with bubble size
  },
});

export default TaskBubble;
