import { create } from 'zustand';
import { supabase } from './supabase';

// Define the Task status
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

// Define the store state
const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  // Fetch tasks for the logged-in user
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
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
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          status: task.status || TaskStatus.TODO,
          priority: task.priority || 3,
          due_date: task.dueDate
        })
        .select();
      
      if (error) throw error;
      
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
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          due_date: updatedTask.dueDate,
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
