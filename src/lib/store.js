import { create } from 'zustand';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Task status
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

// Local storage key for tasks
const LOCAL_TASKS_KEY = 'bubble_local_tasks';

// Define the store state
const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  // Load tasks from local storage
  loadLocalTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const localTasks = await AsyncStorage.getItem(LOCAL_TASKS_KEY);
      set({ 
        tasks: localTasks ? JSON.parse(localTasks) : [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading local tasks:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Save tasks to local storage
  saveLocalTasks: async (tasks) => {
    try {
      await AsyncStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving local tasks:', error);
    }
  },
  
  // Fetch tasks based on auth state
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        // No authenticated user, load from local storage
        await get().loadLocalTasks();
        return;
      }
      
      // User is authenticated, fetch from Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ tasks: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Add a new task
  addTask: async (task) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        // No authenticated user, add to local storage
        const newTask = {
          id: Date.now().toString(),
          title: task.title,
          description: task.description,
          status: task.status || TaskStatus.TODO,
          priority: task.priority || 3,
          importance: task.importance || 3,
          category: task.category || '',
          due_date: task.dueDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        set(state => {
          const newTasks = [newTask, ...state.tasks];
          get().saveLocalTasks(newTasks);
          return { tasks: newTasks, isLoading: false };
        });
        
        return newTask;
      }
      
      // User is authenticated, add to Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status || TaskStatus.TODO,
          priority: task.priority || 3,
          due_date: task.dueDate,
          user_id: session.user.id,
          importance: task.importance || 3,
          category: task.category || ''
        })
        .select();
      
      if (error) {
        // If the error is related to missing user, ask the user to sign out and sign in again
        if (error.code === '23503' && error.message.includes('user_id')) {
          throw new Error('User account not properly set up. Please sign out and sign in again.');
        }
        throw error;
      }
      
      // Update local state with the new task
      set(state => ({ 
        tasks: [data[0], ...state.tasks],
        isLoading: false 
      }));
      
      return data[0];
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Update an existing task
  updateTask: async (id, updatedTask) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        // No authenticated user, update in local storage
        set(state => {
          const newTasks = state.tasks.map(task => 
            task.id === id ? {
              ...task,
              ...updatedTask,
              updated_at: new Date().toISOString()
            } : task
          );
          get().saveLocalTasks(newTasks);
          return { tasks: newTasks, isLoading: false };
        });
        
        return get().tasks.find(task => task.id === id);
      }
      
      // User is authenticated, update in Supabase
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          due_date: updatedTask.dueDate,
          importance: updatedTask.importance || 3,
          category: updatedTask.category || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the task in the local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? data[0] : task
        ),
        isLoading: false
      }));
      
      return data[0];
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  // Delete a task
  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        // No authenticated user, delete from local storage
        set(state => {
          const newTasks = state.tasks.filter(task => task.id !== id);
          get().saveLocalTasks(newTasks);
          return { tasks: newTasks, isLoading: false };
        });
        
        return true;
      }
      
      // User is authenticated, delete from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove the task from local state
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Update task status
  setTaskStatus: async (id, status) => {
    try {
      const task = get().tasks.find(t => t.id === id);
      if (!task) return null;
      
      return await get().updateTask(id, { ...task, status });
    } catch (error) {
      console.error('Error updating task status:', error);
      return null;
    }
  },
  
  // Clear error state
  clearError: () => set({ error: null })
}));

export default useTaskStore;
