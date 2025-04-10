import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Define color palettes
const lightColors = {
  background: '#F8F9FA', // Very light gray
  card: '#FFFFFF',       // White
  text: '#212529',       // Dark Gray
  textSecondary: '#6C757D', // Medium Gray
  border: '#E9ECEF',      // Light Gray Border
  primary: '#4A90E2',     // A modern blue for accents if needed later
  // Bubble Colors (Distinct and vibrant)
  bubbleTodo: '#FF6A88', // Pink/Red (replaced gradient)
  bubbleInProgress: '#FFBF3A', // Yellow/Orange (replaced gradient) 
  bubbleDone: '#28C76F', // Green (replaced gradient)
  bubbleDefault: '#ADB5BD', // Grey for others
  bubbleText: '#FFFFFF',
};

const darkColors = {
  background: '#121212', // Very dark gray
  card: '#1E1E1E',       // Dark Gray
  text: '#E0E0E0',       // Light Gray
  textSecondary: '#A0A0A0', // Medium Light Gray
  border: '#333333',      // Dark Border
  primary: '#4A90E2',     // Same blue accent
  // Bubble Colors (Solid colors instead of gradients)
  bubbleTodo: '#FF6A88',
  bubbleInProgress: '#FFBF3A', 
  bubbleDone: '#28C76F',
  bubbleDefault: '#6C757D',
  bubbleText: '#FFFFFF',
};

export const ThemeContext = createContext({
  isDark: true, // Changed default to true
  colors: darkColors, // Changed default to darkColors
  setScheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Force dark mode as default regardless of system setting
  const colorScheme = useColorScheme(); // Still get system preference
  const [isDark, setIsDark] = useState(true); // Default to true for dark mode

  // Only respect system changes if user hasn't explicitly set a preference
  useEffect(() => {
    // No longer automatically follow system preference
    // We keep this hook in case we want to add a "system" option later
  }, [colorScheme]);

  const defaultTheme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    setScheme: (scheme) => setIsDark(scheme === 'dark'),
  };

  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
