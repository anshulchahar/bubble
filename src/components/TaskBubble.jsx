import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const TaskBubble = ({ task, style, isDragging, onPress, onLongPress }) => {
  const { colors } = useTheme();

  // Calculate bubble size based on priority and importance
  const getBubbleRadius = (priority, importance) => {
    const base = 30;
    const maxAdd = 50;
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };

  // Get bubble gradient colors based on status
  const getBubbleGradient = (status) => {
    switch (status) {
      case 'todo':
        return ['#FF9A8B', '#FF6A88'];
      case 'in-progress':
        return ['#FFD54F', '#FFBF3A'];
      case 'done':
        return ['#81FBB8', '#28C76F'];
      default:
        return [colors.bubbleDefault, colors.bubbleDefault];
    }
  };

  const radius = getBubbleRadius(task.priority, task.importance);
  const gradientColors = getBubbleGradient(task.status);

  // Dynamic styles
  const dynamicStyles = getStyles(radius, colors);

  // Combine styles with dragging styles
  const combinedContainerStyle = [
    dynamicStyles.container,
    style,
    // Add shadow and scale effect when dragging
    isDragging && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 15,
      transform: [{ scale: 1.05 }]
    }
  ];

  // Handle press - make sure to handle the case where onPress is null
  const handlePress = () => {
    if (onPress) {
      onPress(task);
    }
  };

  // Handle long press - make sure to handle the case where onLongPress is null
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(task);
    }
  };

  return (
    <TouchableOpacity
      style={combinedContainerStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColors}
        style={dynamicStyles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={dynamicStyles.labelContainer}>
          <Text style={dynamicStyles.label} numberOfLines={Math.floor(radius / 10)}>
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
    borderRadius: radius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: colors.card,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.bubbleText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: Math.max(10, Math.min(14, radius * 0.3)),
  },
});

export default TaskBubble;
