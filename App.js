import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
