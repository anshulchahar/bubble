import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * TaskBubble component for rendering individual task bubbles
 * 
 * @param {Object} task - The task object to render
 * @param {Function} onPress - Function to call when bubble is pressed
 * @param {Function} onLongPress - Function to call when bubble is long pressed
 */
const TaskBubble = ({ task, onPress, onLongPress }) => {
  // Calculate bubble size based on priority and importance
  const getBubbleRadius = (priority, importance) => {
    const base = 30; // min size
    const maxAdd = 50; // max extra size
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };

  // Get bubble color based on status
  const getBubbleColor = (status) => {
    switch (status) {
      case 'todo':
        return '#4361ee'; // primary blue
      case 'in-progress':
        return '#f8961e'; // warning orange
      case 'done':
        return '#4cc9f0'; // success blue
      default:
        return '#6c757d'; // gray
    }
  };

  const radius = getBubbleRadius(task.priority, task.importance);
  const color = getBubbleColor(task.status);

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      onLongPress={() => onLongPress(task)}
      style={[
        styles.container,
        {
          width: radius * 2,
          height: radius * 2,
        }
      ]}
      activeOpacity={0.8}
    >
      <Svg height="100%" width="100%">
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          fill={color}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.label} numberOfLines={2}>
          {task.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  label: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default TaskBubble;
