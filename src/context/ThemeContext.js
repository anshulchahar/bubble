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
  bubbleTodo: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)', // Pink/Red gradient
  bubbleInProgress: 'linear-gradient(135deg, #FFD54F 0%, #FFBF3A 100%)', // Yellow/Orange gradient
  bubbleDone: 'linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)', // Green gradient
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
  // Bubble Colors (Might need slight adjustments for dark bg, but let's start same)
  bubbleTodo: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)',
  bubbleInProgress: 'linear-gradient(135deg, #FFD54F 0%, #FFBF3A 100%)',
  bubbleDone: 'linear-gradient(135deg, #81FBB8 0%, #28C76F 100%)',
  bubbleDefault: '#6C757D',
  bubbleText: '#FFFFFF',
};

export const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  setScheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme(); // 'light' or 'dark' or null
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
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
