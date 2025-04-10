import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from './src/context/ThemeContext'; // Import ThemeProvider
import HomeScreen from './src/screens/HomeScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider> // Wrap with ThemeProvider
      {/* We can get theme info here if needed for StatusBar */}
      <ThemedApp />
    </ThemeProvider>
  );
}

// Separate component to access theme context easily
function ThemedApp() {
  // const { isDark } = useTheme(); // Example: access theme state

  return (
    <NavigationContainer>
      <StatusBar style="auto" /> {/* Use auto style for StatusBar */}
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
