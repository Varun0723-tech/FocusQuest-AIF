import React, { createContext, useContext, useState, useEffect } from 'react';
import { Priority, Task } from '../models/types';
import { INITIAL_TASKS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { soundService } from '../services/soundService';

interface TaskContextType {
  tasks: Task[];
  filterPriority: Priority | 'All';
  filterStatus: 'All' | 'Pending' | 'Completed';
  searchQuery: string;
  sortBy: 'deadline' | 'priority' | 'xp' | 'created';
  setFilterPriority: (priority: Priority | 'All') => void;
  setFilterStatus: (status: 'All' | 'Pending' | 'Completed') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'deadline' | 'priority' | 'xp' | 'created') => void;
  addTask: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  importAITasks: (newTasks: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>[]) => void;
  getTaskById: (id: string) => Task | undefined;
}

const LOCAL_STORAGE_TASKS_KEY = 'focusquest_tasks_v1';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addXp } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'xp' | 'created'>('deadline');

  // Load user tasks
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(INITIAL_TASKS);
      }
    } catch {
      setTasks(INITIAL_TASKS);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'guest',
      completed: false,
      createdAt: new Date().toISOString(),
      xpReward: taskData.xpReward || (taskData.priority === 'High' ? 40 : taskData.priority === 'Medium' ? 25 : 15),
    };
    setTasks((prev) => [newTask, ...prev]);
    soundService.playClick();
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    soundService.playClick();
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          if (isCompleting) {
            addXp(t.xpReward, `Completed: ${t.title}`);
          }
          return {
            ...t,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return {
            ...t,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
    soundService.playClick();
  };

  const importAITasks = (newTasks: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed'>[]) => {
    const formatted = newTasks.map((t) => ({
      ...t,
      id: `task_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'guest',
      completed: false,
      createdAt: new Date().toISOString(),
      xpReward: t.priority === 'High' ? 45 : t.priority === 'Medium' ? 30 : 20,
    }));

    setTasks((prev) => [...formatted, ...prev]);
    soundService.playXpGain();
  };

  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filterPriority,
        filterStatus,
        searchQuery,
        sortBy,
        setFilterPriority,
        setFilterStatus,
        setSearchQuery,
        setSortBy,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        importAITasks,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
