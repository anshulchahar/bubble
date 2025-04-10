import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import TaskBubble from './TaskBubble';
import { useTheme } from '../context/ThemeContext'; // Import useTheme

const BubbleCanvas = ({ tasks, onBubblePress, onBubbleLongPress }) => {
  const [bubblePositions, setBubblePositions] = useState({});
  const canvasRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const { colors } = useTheme(); // Use theme colors

  // Function to calculate bubble radius (keep consistent)
  const getBubbleRadius = (priority, importance) => {
    const base = 30; // min size
    const maxAdd = 50; // max extra size
    const total = priority * 0.6 + importance * 0.4; // Prioritize priority slightly
    return base + (total / 10) * maxAdd;
  };

  // Initialize bubble positions when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const newPositions = {};
      const canvasWidth = width - 32; // Account for margin in HomeScreen
      const canvasHeight = height * 0.6; // Estimate canvas height

      tasks.forEach((task, index) => {
        if (!bubblePositions[task.id]) {
          // Simple grid/random placement within canvas bounds
          const radius = getBubbleRadius(task.priority, task.importance);
          const x = radius + Math.random() * (canvasWidth - radius * 2);
          const y = radius + Math.random() * (canvasHeight - radius * 2);

          newPositions[task.id] = { x, y };
        } else {
          // Keep existing position, but clamp to bounds
          const radius = getBubbleRadius(task.priority, task.importance);
          const currentX = bubblePositions[task.id].x;
          const currentY = bubblePositions[task.id].y;
          newPositions[task.id] = {
             x: Math.max(radius, Math.min(currentX, canvasWidth - radius)),
             y: Math.max(radius, Math.min(currentY, canvasHeight - radius))
          };
        }
      });
      setBubblePositions(newPositions);
    }
    // Dependency on task length and screen dimensions
  }, [tasks, width, height]);

  // Helper function to find which bubble was touched
  const findTouchedBubble = (x, y) => {
    // Iterate backwards so top bubbles are checked first
    for (let i = tasks.length - 1; i >= 0; i--) {
      const task = tasks[i];
      const bubblePos = bubblePositions[task.id];
      if (!bubblePos) continue;

      const radius = getBubbleRadius(task.priority, task.importance);
      const bubbleCenterX = bubblePos.x;
      const bubbleCenterY = bubblePos.y;

      // Check if touch is within bubble
      const distance = Math.sqrt(
        Math.pow(x - bubbleCenterX, 2) + Math.pow(y - bubbleCenterY, 2)
      );

      if (distance <= radius) {
        return task.id;
      }
    }
    return null;
  };

  // Set up pan responder for dragging bubbles
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => !!findTouchedBubble(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const touchedTaskId = findTouchedBubble(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        panResponder.current.touchedTaskId = touchedTaskId;
        // Bring touched bubble to front (optional, requires re-rendering order)
      },
      onPanResponderMove: (evt, gestureState) => {
        const { touchedTaskId } = panResponder.current;
        if (touchedTaskId && bubblePositions[touchedTaskId]) {
          const task = tasks.find(t => t.id === touchedTaskId);
          if (!task) return;

          const radius = getBubbleRadius(task.priority, task.importance);
          const canvasWidth = width - 32;
          const canvasHeight = height * 0.6; // Re-estimate or pass actual height

          setBubblePositions(prev => {
            const newX = prev[touchedTaskId].x + gestureState.dx;
            const newY = prev[touchedTaskId].y + gestureState.dy;
            return {
              ...prev,
              [touchedTaskId]: {
                // Clamp position within canvas bounds
                x: Math.max(radius, Math.min(newX, canvasWidth - radius)),
                y: Math.max(radius, Math.min(newY, canvasHeight - radius)),
              }
            };
          });
        }
      },
      onPanResponderRelease: () => {
        panResponder.current.touchedTaskId = null;
      }
    })
  ).current;

  // Dynamic styles using theme
  const styles = getStyles(colors);

  return (
    <View
      style={styles.container}
      ref={canvasRef}
      {...panResponder.panHandlers}
    >
      {tasks.map(task => {
        const position = bubblePositions[task.id];
        if (!position) return null;

        const radius = getBubbleRadius(task.priority, task.importance);

        return (
          <TaskBubble
            key={task.id}
            task={task}
            onPress={onBubblePress}
            onLongPress={onBubbleLongPress}
            style={{
              position: 'absolute', // Position must be absolute here
              left: position.x - radius, // Adjust left/top based on center position
              top: position.y - radius,
            }}
          />
        );
      })}
    </View>
  );
};

// Function to generate styles based on theme colors
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card, // Use theme card color for canvas background
    position: 'relative',
  },
});

export default BubbleCanvas;
