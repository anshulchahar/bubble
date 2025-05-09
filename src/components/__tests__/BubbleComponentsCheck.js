// Basic test file to verify that our components can be imported without errors
import React from 'react';
import TaskBubble from '../TaskBubble';
import BubbleCanvas from '../BubbleCanvas';

// This is just a placeholder to verify imports work
// In a real app, you would have actual tests here
export const dummyTask = {
  id: '1',
  title: 'Test Task',
  priority: 5,
  importance: 5,
  status: 'todo'
};

// Export components to verify they can be imported
export { TaskBubble, BubbleCanvas }; 