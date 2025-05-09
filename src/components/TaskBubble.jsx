import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const TaskBubble = ({ task, style, isDragging, onPress, onLongPress }) => {
  const { colors } = useTheme();
  const [dragging, setDragging] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  
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

  // Create a simple pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the current position in the offset
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Set a timer for long press detection
        setTimeout(() => {
          setDragging(true);
        }, 200);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        pan.flattenOffset();
        
        // Check if this was a quick tap vs. a drag
        if (!dragging && Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          if (onPress) onPress(task);
        } else {
          // Was a drag - call long press handler if needed
          if (dragging && onLongPress) onLongPress(task);
        }
        
        setDragging(false);
      }
    })
  ).current;

  // Dynamic styles
  const dynamicStyles = getStyles(radius, colors);

  // Calculate animated styles
  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }],
    ...dragging && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 20,
      zIndex: 1000,
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: 1.1 }
      ]
    }
  };

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        style,
        animatedStyle
      ]}
      {...panResponder.panHandlers}
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
    </Animated.View>
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
  }
});

export default TaskBubble;
