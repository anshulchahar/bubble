import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskBubble from './TaskBubble';
import { useTheme } from '../context/ThemeContext';

const BubbleCanvas = ({ tasks, onBubblePress, onBubbleLongPress }) => {
  // State for bubble positions
  const [bubblePositions, setBubblePositions] = useState({});
  const { width, height } = Dimensions.get('window');
  const { colors } = useTheme();
  
  // Initialize positions when tasks change
  useEffect(() => {
    const newPositions = { ...bubblePositions };
    
    // Add new tasks with random positions
    tasks.forEach(task => {
      if (!task.id) return;
      
      if (!newPositions[task.id]) {
        // Create a random position within the canvas
        newPositions[task.id] = {
          x: Math.random() * (width * 0.7) + width * 0.15,
          y: Math.random() * (height * 0.5) + height * 0.15
        };
      }
    });
    
    // Remove positions for deleted tasks
    const taskIds = new Set(tasks.map(t => t.id));
    Object.keys(newPositions).forEach(id => {
      if (!taskIds.has(id)) {
        delete newPositions[id];
      }
    });
    
    setBubblePositions(newPositions);
  }, [tasks]);

  // Calculate bubble radius based on priority and importance
  const getBubbleRadius = (priority, importance) => {
    const base = 30;
    const maxAdd = 50;
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };

  // Get styles based on theme
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {tasks.filter(task => !!task.id).map(task => {
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
              position: 'absolute',
              left: position.x - radius,
              top: position.y - radius,
            }}
          />
        );
      })}
      
      {/* Recenter button */}
      <TouchableOpacity 
        style={styles.recenterButton}
        onPress={() => setBubblePositions({})} // Reset positions to trigger re-layout
      >
        <Ionicons name="refresh" size={20} color={colors.bubbleText} />
      </TouchableOpacity>
    </View>
  );
};

// Function to generate styles based on theme colors
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    position: 'relative',
    overflow: 'hidden',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default BubbleCanvas;
