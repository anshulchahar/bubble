import { create } from 'zustand';

// Define the Task type
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

// Define the store state
const useTaskStore = create((set) => ({
  tasks: [],
  
  addTask: (task) => set((state) => {
    const now = new Date().toISOString();
    const newTask = {
      id: Date.now().toString(),
      ...task,
      createdAt: now,
      updatedAt: now,
    };
    return { tasks: [...state.tasks, newTask] };
  }),
  
  updateTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === id 
        ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } 
        : task
    ),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  
  setTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === id 
        ? { ...task, status, updatedAt: new Date().toISOString() } 
        : task
    ),
  })),
}));

export default useTaskStore;
