import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import TaskBubble from './TaskBubble';

/**
 * BubbleCanvas component for rendering and managing task bubbles
 * 
 * @param {Array} tasks - Array of task objects to display
 * @param {Function} onBubblePress - Function to call when a bubble is pressed
 * @param {Function} onBubbleLongPress - Function to call when a bubble is long pressed
 */
const BubbleCanvas = ({ tasks, onBubblePress, onBubbleLongPress }) => {
  const [bubblePositions, setBubblePositions] = useState({});
  const canvasRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  
  // Initialize bubble positions when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const newPositions = {};
      
      // Assign initial positions to bubbles
      tasks.forEach((task, index) => {
        if (!bubblePositions[task.id]) {
          // Create a spiral layout or grid layout
          const angle = index * 0.5;
          const radius = 100 + index * 20;
          const x = width / 2 + radius * Math.cos(angle);
          const y = height / 3 + radius * Math.sin(angle);
          
          newPositions[task.id] = { x, y };
        } else {
          // Keep existing position
          newPositions[task.id] = bubblePositions[task.id];
        }
      });
      
      setBubblePositions(newPositions);
    }
  }, [tasks]);
  
  // Set up pan responder for dragging bubbles
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        // Find which bubble was touched
        const { locationX, locationY } = evt.nativeEvent;
        const touchedTaskId = findTouchedBubble(locationX, locationY);
        
        if (touchedTaskId) {
          // Store the touched bubble ID
          panResponder.current.touchedTaskId = touchedTaskId;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const { touchedTaskId } = panResponder.current;
        
        if (touchedTaskId) {
          // Update the position of the touched bubble
          setBubblePositions(prev => ({
            ...prev,
            [touchedTaskId]: {
              x: prev[touchedTaskId].x + gestureState.dx,
              y: prev[touchedTaskId].y + gestureState.dy
            }
          }));
          
          // Reset delta values to avoid accumulation
          gestureState.dx = 0;
          gestureState.dy = 0;
        }
      },
      onPanResponderRelease: () => {
        // Clear the touched bubble ID
        panResponder.current.touchedTaskId = null;
      }
    })
  ).current;
  
  // Helper function to find which bubble was touched
  const findTouchedBubble = (x, y) => {
    for (const taskId in bubblePositions) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) continue;
      
      const bubblePos = bubblePositions[taskId];
      const radius = getBubbleRadius(task.priority, task.importance);
      
      // Check if touch is within bubble
      const distance = Math.sqrt(
        Math.pow(x - bubblePos.x, 2) + Math.pow(y - bubblePos.y, 2)
      );
      
      if (distance <= radius) {
        return taskId;
      }
    }
    
    return null;
  };
  
  // Calculate bubble size based on priority and importance
  const getBubbleRadius = (priority, importance) => {
    const base = 30; // min size
    const maxAdd = 50; // max extra size
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };
  
  return (
    <View 
      style={styles.container} 
      ref={canvasRef}
      {...panResponder.panHandlers}
    >
      {tasks.map(task => {
        const position = bubblePositions[task.id];
        
        if (!position) return null;
        
        return (
          <TaskBubble
            key={task.id}
            task={task}
            onPress={onBubblePress}
            onLongPress={onBubbleLongPress}
            style={{
              left: position.x,
              top: position.y,
              transform: [
                { translateX: -getBubbleRadius(task.priority, task.importance) },
                { translateY: -getBubbleRadius(task.priority, task.importance) }
              ]
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
});

export default BubbleCanvas;
