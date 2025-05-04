import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Import expo-haptics
import TaskBubble from './TaskBubble';
import { useTheme } from '../context/ThemeContext';

const BubbleCanvas = ({ tasks, onBubblePress, onBubbleLongPress }) => {
  // Canvas state
  const [bubblePositions, setBubblePositions] = useState({});
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  
  // Debug state (remove in production)
  const [debugInfo, setDebugInfo] = useState({ taskCount: 0 });
  
  // Refs
  const canvasRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const { colors } = useTheme();
  const touchedTaskIdRef = useRef(null);
  const prevTasksRef = useRef([]);
  const longPressTimerRef = useRef(null);
  const panningRef = useRef(false);
  const lastCanvasGestureRef = useRef({ x: 0, y: 0 });
  const initialTouchPositionRef = useRef({ x: 0, y: 0 });
  const lastGestureStateRef = useRef({ dx: 0, dy: 0 });
  const bubblePhysicsTimerRef = useRef(null);
  const physicsEnabledRef = useRef(true);
  const isMovingRef = useRef(false);

  // Animation refs
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Function to calculate bubble radius
  const getBubbleRadius = (priority, importance) => {
    const base = 30;
    const maxAdd = 40;
    const total = priority * 0.6 + importance * 0.4;
    return base + (total / 10) * maxAdd;
  };

  // Initialize canvas dimensions
  const measureCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          setCanvasDimensions({ width, height });
        }
      });
    }
  };

  useEffect(() => {
    // Set up the initial measurement after render
    setTimeout(measureCanvas, 500);
    
    // Set up physics simulation loop
    startPhysicsSimulation();
    
    return () => {
      // Clean up physics timer on unmount
      if (bubblePhysicsTimerRef.current) {
        clearTimeout(bubblePhysicsTimerRef.current);
      }
    };
  }, []);

  // Track tasks for debugging
  useEffect(() => {
    // Filter out tasks without IDs to prevent warnings
    const validTasks = tasks.filter(task => !!task.id);
    if (validTasks.length !== tasks.length) {
      console.warn(`Filtered out ${tasks.length - validTasks.length} tasks without IDs`);
    }
    
    setDebugInfo(prev => ({ ...prev, taskCount: validTasks.length }));
    
    // Force a recentering when tasks change significantly
    if (validTasks.length !== prevTasksRef.current.length) {
      setTimeout(recenterCanvas, 500);
    }
  }, [tasks]);

  // Start the physics simulation loop for bubble interactions
  const startPhysicsSimulation = () => {
    const runPhysics = () => {
      if (physicsEnabledRef.current && tasks.filter(task => !!task.id).length > 1) {
        applyPhysics();
      }
      
      // Schedule next frame
      bubblePhysicsTimerRef.current = setTimeout(runPhysics, 50); // ~20fps is enough for smooth repulsion
    };
    
    runPhysics();
  };

  // Apply physics-based forces to bubbles to prevent overlap
  const applyPhysics = () => {
    // Filter out tasks without IDs
    const validTasks = tasks.filter(task => !!task.id);
    
    // Skip physics if there are no bubbles or only one bubble
    if (validTasks.length <= 1 || Object.keys(bubblePositions).length <= 1) return;
    
    // Only apply physics if bubbles are actually overlapping
    let hasOverlap = false;
    
    // Check for any overlap first 
    for (let i = 0; i < validTasks.length; i++) {
      const taskA = validTasks[i];
      const posA = bubblePositions[taskA.id];
      if (!posA) continue;
      
      const radiusA = getBubbleRadius(taskA.priority, taskA.importance);
      
      for (let j = i + 1; j < validTasks.length; j++) {
        const taskB = validTasks[j];
        const posB = bubblePositions[taskB.id];
        if (!posB) continue;
        
        const radiusB = getBubbleRadius(taskB.priority, taskB.importance);
        
        // Distance between bubble centers
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Minimum distance to prevent overlap
        const minDistance = radiusA + radiusB;
        
        if (distance < minDistance) {
          hasOverlap = true;
          break;
        }
      }
      if (hasOverlap) break;
    }
    
    // Skip applying forces if no overlaps are found (optimization)
    if (!hasOverlap && !longPressActive) return;
    
    // Calculate and apply forces
    setBubblePositions(prev => {
      const newPositions = { ...prev };
      
      // For each pair of bubbles, calculate repulsion force
      for (let i = 0; i < validTasks.length; i++) {
        const taskA = validTasks[i];
        if (!newPositions[taskA.id]) continue;
        
        const radiusA = getBubbleRadius(taskA.priority, taskA.importance);
        let forceX = 0;
        let forceY = 0;
        
        for (let j = 0; j < validTasks.length; j++) {
          if (i === j) continue;  // Skip self
          
          const taskB = validTasks[j];
          if (!newPositions[taskB.id]) continue;
          
          const radiusB = getBubbleRadius(taskB.priority, taskB.importance);
          
          // Distance between bubble centers
          const dx = newPositions[taskB.id].x - newPositions[taskA.id].x;
          const dy = newPositions[taskB.id].y - newPositions[taskA.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Minimum distance to prevent overlap plus a small buffer
          const minDistance = radiusA + radiusB + 5;
          
          // Apply stronger repulsion when bubbles overlap
          if (distance < minDistance) {
            const overlap = minDistance - distance;
            
            // Calculate normalized direction vector
            let dirX = dx / (distance || 1); // Avoid division by zero
            let dirY = dy / (distance || 1);
            
            // If bubbles are exactly on top of each other, move in a random direction
            if (distance < 1) {
              const angle = Math.random() * Math.PI * 2;
              dirX = Math.cos(angle);
              dirY = Math.sin(angle);
            }
            
            // Calculate repulsion force (stronger when more overlap)
            const repulsionStrength = 
              Math.min(overlap * 0.2, 20) * 
              // Reduce effect if bubble is being dragged
              (taskA.id === touchedTaskIdRef.current && longPressActive ? 0.3 : 1);
            
            forceX -= dirX * repulsionStrength;
            forceY -= dirY * repulsionStrength;
          }
        }
        
        // Skip if no force to apply
        if (forceX === 0 && forceY === 0) continue;
        
        // Don't move the bubble being dragged by the user
        if (taskA.id === touchedTaskIdRef.current && longPressActive) continue;
        
        // Apply calculated force to update bubble position
        newPositions[taskA.id] = {
          x: newPositions[taskA.id].x + forceX,
          y: newPositions[taskA.id].y + forceY
        };
      }
      
      // Return updated positions
      return newPositions;
    });
  };

  // Update panX and panY when canvasOffset changes
  useEffect(() => {
    panX.setValue(canvasOffset.x);
    panY.setValue(canvasOffset.y);
  }, [canvasOffset]);

  // Find initial positions for bubbles with better spread
  const findInitialBubblePosition = (task, newPositions, canvasWidth, canvasHeight, validTasks) => {
    const radius = getBubbleRadius(task.priority, task.importance);
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Start with deterministic position based on task index
    const idx = validTasks.findIndex(t => t.id === task.id);
    
    // Increase variety in initial positions with different factors based on task ID
    const uniqueFactor = parseInt(task.id.slice(-4), 10) % 10 || 1;
    const spiralFactor = 0.8 + (uniqueFactor * 0.1);
    const startAngle = (idx * 1.2) + (uniqueFactor * 0.2);
    let angle = startAngle;
    let distance = 80 + (idx * 20); // Larger initial distance to keep bubbles farther apart
    
    // Try to find a non-overlapping position
    const maxTries = 30;
    let bestPosition = null;
    let leastOverlap = Infinity;
    
    for (let tries = 0; tries < maxTries; tries++) {
      // Calculate position along the spiral
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Check overlap with existing bubbles
      let overlapping = false;
      let totalOverlap = 0;
      
      Object.entries(newPositions).forEach(([id, pos]) => {
        if (id === task.id) return; // Skip self
        
        const otherTask = validTasks.find(t => t.id === id);
        if (!otherTask) return;
        
        const otherRadius = getBubbleRadius(otherTask.priority, otherTask.importance);
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = radius + otherRadius + 10; // Add extra buffer
        
        if (distance < minDistance) {
          overlapping = true;
          totalOverlap += (minDistance - distance);
        }
      });
      
      // If no overlap, we found a good position
      if (!overlapping) {
        return { x, y };
      }
      
      // Keep track of position with least overlap
      if (totalOverlap < leastOverlap) {
        leastOverlap = totalOverlap;
        bestPosition = { x, y };
      }
      
      // Move along the spiral for next attempt
      angle += spiralFactor;
      distance += 15;
    }
    
    // Return the best position if we couldn't find a non-overlapping one
    return bestPosition || { x: centerX + (Math.random() * 100 - 50), y: centerY + (Math.random() * 100 - 50) };
  };

  // Initialize bubble positions when tasks change
  useEffect(() => {
    // Filter out tasks without IDs
    const validTasks = tasks.filter(task => !!task.id);
    
    if (validTasks.length > 0) {
      // Only proceed if we have valid canvas dimensions
      const canvasWidth = canvasDimensions.width || width - 32;
      const canvasHeight = canvasDimensions.height || height * 0.6;
      
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        // If canvas dimensions aren't ready, schedule another attempt
        setTimeout(measureCanvas, 500);
        return;
      }
      
      // Update positions for existing and new tasks
      setBubblePositions(prevPositions => {
        const newPositions = { ...prevPositions };
        
        // Add positions for new tasks
        validTasks.forEach(task => {
          if (!newPositions[task.id]) {
            // Find initial position that minimizes overlap
            newPositions[task.id] = findInitialBubblePosition(
              task, newPositions, canvasWidth, canvasHeight, validTasks
            );
          }
        });
        
        // Store current tasks for future reference
        prevTasksRef.current = [...validTasks];
        
        return newPositions;
      });
    }
  }, [tasks, canvasDimensions]);

  // Helper function to find which bubble was touched
  const findTouchedBubble = (x, y) => {
    // Filter out tasks without IDs
    const validTasks = tasks.filter(task => !!task.id);
    
    // Adjust coordinates for canvas offset and scaling
    const adjustedX = (x - canvasOffset.x) / canvasScale;
    const adjustedY = (y - canvasOffset.y) / canvasScale;
    
    // Iterate backwards so top bubbles are checked first
    for (let i = validTasks.length - 1; i >= 0; i--) {
      const task = validTasks[i];
      const bubblePos = bubblePositions[task.id];
      if (!bubblePos) continue;

      const radius = getBubbleRadius(task.priority, task.importance);
      const bubbleCenterX = bubblePos.x;
      const bubbleCenterY = bubblePos.y;

      // Check if touch is within bubble
      const distance = Math.sqrt(
        Math.pow(adjustedX - bubbleCenterX, 2) + Math.pow(adjustedY - bubbleCenterY, 2)
      );

      if (distance <= radius) {
        return task.id;
      }
    }
    return null;
  };

  // Function to recenter the canvas around all tasks
  const recenterCanvas = () => {
    if (Object.keys(bubblePositions).length === 0) return;

    // Calculate the bounding box of all bubbles
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    tasks.filter(task => !!task.id).forEach(task => {
      const pos = bubblePositions[task.id];
      if (!pos) return;
      
      const radius = getBubbleRadius(task.priority, task.importance);
      
      minX = Math.min(minX, pos.x - radius);
      minY = Math.min(minY, pos.y - radius);
      maxX = Math.max(maxX, pos.x + radius);
      maxY = Math.max(maxY, pos.y + radius);
    });
    
    // Calculate center of all bubbles
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Calculate offset to center the bubbles in the canvas
    const offsetX = (canvasDimensions.width / 2) - centerX;
    const offsetY = (canvasDimensions.height / 2) - centerY;
    
    // Animate to new position
    Animated.parallel([
      Animated.spring(panX, {
        toValue: offsetX,
        useNativeDriver: true,
        friction: 7,
        tension: 40
      }),
      Animated.spring(panY, {
        toValue: offsetY,
        useNativeDriver: true,
        friction: 7,
        tension: 40
      })
    ]).start(() => {
      setCanvasOffset({ x: offsetX, y: offsetY });
    });
  };

  // Set up pan responder for both canvas panning and bubble dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Allow movement if we're already interacting with a bubble or canvas
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        return touchedTaskIdRef.current !== null || isDraggingCanvas || dx > 5 || dy > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Capture the gesture when it clearly looks like a drag
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        return (longPressActive && touchedTaskIdRef.current) || dx > 10 || dy > 10;
      },
      
      onPanResponderGrant: (evt, gestureState) => {
        // Store initial touch position for better calculations
        initialTouchPositionRef.current = {
          x: gestureState.x0,
          y: gestureState.y0
        };
        
        // Reset last gesture state
        lastGestureStateRef.current = { dx: 0, dy: 0 };
        isMovingRef.current = false;
        
        // Find which bubble was touched, if any
        const touchLocationX = evt.nativeEvent.locationX || gestureState.x0;
        const touchLocationY = evt.nativeEvent.locationY || gestureState.y0;
        const touchedTaskId = findTouchedBubble(touchLocationX, touchLocationY);
        
        // Clear any existing timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        
        // Set up long press detection timer
        if (touchedTaskId) {
          touchedTaskIdRef.current = touchedTaskId; // Store task ID for later use
          
          longPressTimerRef.current = setTimeout(() => {
            setLongPressActive(true); // Indicate that long press dragging is active
            
            // Call the onBubbleLongPress if provided
            const task = tasks.find(t => t.id === touchedTaskId);
            if (task && onBubbleLongPress) {
              onBubbleLongPress(task);
            }
            
            // Provide haptic feedback if available
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Force canvas rerender to show the bubble at the top layer
            setBubblePositions(prev => ({ ...prev }));
          }, 500); // Slightly longer to ensure it's a deliberate long press
        } else {
          // If not touching a bubble, prepare for canvas panning
          setIsDraggingCanvas(true);
          panningRef.current = true;
          lastCanvasGestureRef.current = {
            x: gestureState.x0,
            y: gestureState.y0
          };
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Calculate actual movement from last frame
        const deltaX = gestureState.dx - lastGestureStateRef.current.dx;
        const deltaY = gestureState.dy - lastGestureStateRef.current.dy;
        
        // Update last gesture state
        lastGestureStateRef.current = { dx: gestureState.dx, dy: gestureState.dy };
        
        // If significant movement detected before long press timer, cancel long press
        const hasSignificantMovement = Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
        if (hasSignificantMovement) {
          isMovingRef.current = true;
          
          if (longPressTimerRef.current && !longPressActive) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }
        
        const touchedTaskId = touchedTaskIdRef.current;
        
        // Handle bubble dragging if long press is active
        if (touchedTaskId && longPressActive) {
          setBubblePositions(prev => {
            const taskToMove = tasks.find(t => t.id === touchedTaskId);
            if (!taskToMove || !prev[touchedTaskId]) return prev;
            
            return {
              ...prev,
              [touchedTaskId]: {
                x: prev[touchedTaskId].x + deltaX / canvasScale,
                y: prev[touchedTaskId].y + deltaY / canvasScale
              }
            };
          });
          
          // Prevent default behavior while dragging
          return true;
        }
        // Handle canvas panning
        else if (isDraggingCanvas) {
          setCanvasOffset(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
          }));
          
          // Update animated values
          panX.setValue(canvasOffset.x + deltaX);
          panY.setValue(canvasOffset.y + deltaY);
          
          lastCanvasGestureRef.current = {
            x: gestureState.moveX,
            y: gestureState.moveY
          };
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // Clear long press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        
        // Handle bubble press (tap, not drag) if no significant movement
        const touchedTaskId = touchedTaskIdRef.current;
        const isJustTap = !isMovingRef.current && Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;
        
        if (touchedTaskId && !longPressActive && isJustTap) {
          const task = tasks.find(t => t.id === touchedTaskId);
          if (task && onBubblePress) {
            onBubblePress(task);
          }
        }
        
        // Reset dragging states
        setIsDraggingCanvas(false);
        setLongPressActive(false);
        touchedTaskIdRef.current = null;
        panningRef.current = false;
        isMovingRef.current = false;
      },
      
      onPanResponderTerminate: () => {
        // Reset all interaction states
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        setIsDraggingCanvas(false);
        setLongPressActive(false);
        touchedTaskIdRef.current = null;
        panningRef.current = false;
        isMovingRef.current = false;
      },
    })
  ).current;

  // Dynamic styles using theme
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View
        ref={canvasRef}
        style={[
          styles.canvasContent,
          { transform: [{ translateX: panX }, { translateY: panY }, { scale: canvasScale }] }
        ]}
        {...panResponder.panHandlers}
        onLayout={measureCanvas}
      >
        {tasks.filter(task => !!task.id).map((task) => {
          const position = bubblePositions[task.id];
          if (!position) return null;

          const radius = getBubbleRadius(task.priority, task.importance);

          return (
            <TaskBubble
              key={task.id}
              task={task}
              onPress={null} // We handle press in panResponder
              onLongPress={null} // We handle long press in panResponder
              style={{
                position: 'absolute',
                left: position.x - radius,
                top: position.y - radius,
                zIndex: longPressActive && touchedTaskIdRef.current === task.id ? 1000 : 1,
              }}
            />
          );
        })}
      </Animated.View>
      
      {/* Recenter button */}
      <TouchableOpacity 
        style={styles.recenterButton}
        onPress={recenterCanvas}
      >
        <Ionicons name="locate" size={20} color={colors.bubbleText} />
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
  canvasContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 16,
    left: 16, // Changed from right to left
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
  }
});

export default BubbleCanvas;
