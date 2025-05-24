import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // Import AuthProvider
import HomeScreen from './src/screens/HomeScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import SignInScreen from './src/screens/SignInScreen'; // Import SignInScreen
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import useTaskStore from './src/lib/store';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Separate component to access theme and auth context easily
function ThemedApp() {
  const { isDark } = useTheme(); // Access theme state
  const { user, loading } = useAuth(); // Access auth state
  const { fetchTasks } = useTaskStore();

  // Fetch tasks when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="ContactUs" component={require('./src/screens/ContactUsScreen').default} />
        <Stack.Screen name="ReportIssue" component={require('./src/screens/ReportIssueScreen').default} />
        <Stack.Screen name="FAQ" component={require('./src/screens/FAQScreen').default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
