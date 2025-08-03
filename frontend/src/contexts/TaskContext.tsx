// d:\Trae\frontend\src\contexts\TaskContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import { wsService } from '../services/websocketService';

export interface Task {
  id: string;
  type: 'purchase' | 'agent_deploy' | 'stealth_update' | 'payment_process' | 'data_sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';
  priority: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  purchaseId?: string;
  title: string;
  description: string;
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
  logs: TaskLog[];
  dependencies?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  resourceUsage?: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface TaskLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: any;
}

export interface TaskQueue {
  id: string;
  name: string;
  type: 'high_priority' | 'normal' | 'background' | 'stealth';
  tasks: Task[];
  maxConcurrent: number;
  currentRunning: number;
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  isActive: boolean;
}

export interface TaskStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  successRate: number;
  averageProcessingTime: number;
  queueLength: number;
  throughput: number; // tasks per minute
}

interface TaskContextType {
  tasks: Task[];
  queues: TaskQueue[];
  stats: TaskStats;
  loading: boolean;
  error: string | null;
  
  // Task Management
  createTask: (task: Omit<Task, 'id' | 'logs' | 'retryCount'>) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  getTask: (taskId: string) => Task | undefined;
  
  // Queue Management
  pauseQueue: (queueId: string) => Promise<void>;
  resumeQueue: (queueId: string) => Promise<void>;
  clearQueue: (queueId: string) => Promise<void>;
  
  // Filtering and Search
  filterTasks: (filters: TaskFilters) => Task[];
  searchTasks: (query: string) => Task[];
  
  // Real-time Updates
  subscribeToTask: (taskId: string, callback: (task: Task) => void) => () => void;
  subscribeToQueue: (queueId: string, callback: (queue: TaskQueue) => void) => () => void;
  
  // Analytics
  getTaskAnalytics: (timeRange: string) => Promise<TaskAnalytics>;
  exportTasks: (format: 'csv' | 'json') => Promise<void>;
}

export interface TaskFilters {
  status?: Task['status'][];
  type?: Task['type'][];
  priority?: Task['priority'][];
  agentId?: string;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface TaskAnalytics {
  totalTasks: number;
  completionRate: number;
  averageProcessingTime: number;
  errorRate: number;
  throughputTrend: Array<{ timestamp: number; count: number }>;
  statusDistribution: Record<Task['status'], number>;
  typeDistribution: Record<Task['type'], number>;
  priorityDistribution: Record<Task['priority'], number>;
  performanceMetrics: {
    p50: number;
    p95: number;
    p99: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [queues, setQueues] = useState<TaskQueue[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    successRate: 0,
    averageProcessingTime: 0,
    queueLength: 0,
    throughput: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscription callbacks
  const [taskSubscriptions] = useState<Map<string, Set<(task: Task) => void>>>(new Map());
  const [queueSubscriptions] = useState<Map<string, Set<(queue: TaskQueue) => void>>>(new Map());

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadQueues();
    loadStats();
  }, []);

  // WebSocket subscriptions
  useEffect(() => {
    const unsubscribeTask = wsService.subscribe('TASK_UPDATE', (data: any) => {
      const updatedTask = data.task as Task;
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      
      // Notify subscribers
      const callbacks = taskSubscriptions.get(updatedTask.id);
      if (callbacks) {
        callbacks.forEach(callback => callback(updatedTask));
      }
    });

    const unsubscribeQueue = wsService.subscribe('QUEUE_UPDATE', (data: any) => {
      const updatedQueue = data.queue as TaskQueue;
      setQueues(prev => prev.map(queue => 
        queue.id === updatedQueue.id ? updatedQueue : queue
      ));
      
      // Notify subscribers
      const callbacks = queueSubscriptions.get(updatedQueue.id);
      if (callbacks) {
        callbacks.forEach(callback => callback(updatedQueue));
      }
    });

    const unsubscribeStats = wsService.subscribe('TASK_STATS_UPDATE', (data: any) => {
      setStats(data.stats);
    });

    return () => {
      unsubscribeTask();
      unsubscribeQueue();
      unsubscribeStats();
    };
  }, [taskSubscriptions, queueSubscriptions]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQueues = async () => {
    try {
      const response = await apiService.get('/tasks/queues');
      setQueues(response.data);
    } catch (err) {
      console.error('Error loading queues:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.get('/tasks/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'logs' | 'retryCount'>) => {
    try {
      const response = await apiService.post('/tasks', {
        ...taskData,
        retryCount: 0,
        logs: []
      });
      
      const newTask = response.data;
      setTasks(prev => [...prev, newTask]);
      
      // Update stats
      loadStats();
    } catch (err) {
      setError('Failed to create task');
      throw err;
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      await apiService.post(`/tasks/${taskId}/cancel`);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'cancelled' as const, endTime: Date.now() }
          : task
      ));
    } catch (err) {
      setError('Failed to cancel task');
      throw err;
    }
  };

  const retryTask = async (taskId: string) => {
    try {
      await apiService.post(`/tasks/${taskId}/retry`);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'pending' as const, 
              retryCount: task.retryCount + 1,
              error: undefined,
              endTime: undefined
            }
          : task
      ));
    } catch (err) {
      setError('Failed to retry task');
      throw err;
    }
  };

  const getTask = (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  const pauseQueue = async (queueId: string) => {
    try {
      await apiService.post(`/tasks/queues/${queueId}/pause`);
      
      setQueues(prev => prev.map(queue => 
        queue.id === queueId ? { ...queue, isActive: false } : queue
      ));
    } catch (err) {
      setError('Failed to pause queue');
      throw err;
    }
  };

  const resumeQueue = async (queueId: string) => {
    try {
      await apiService.post(`/tasks/queues/${queueId}/resume`);
      
      setQueues(prev => prev.map(queue => 
        queue.id === queueId ? { ...queue, isActive: true } : queue
      ));
    } catch (err) {
      setError('Failed to resume queue');
      throw err;
    }
  };

  const clearQueue = async (queueId: string) => {
    try {
      await apiService.post(`/tasks/queues/${queueId}/clear`);
      
      // Remove tasks from this queue
      setTasks(prev => prev.filter(task => 
        !queues.find(q => q.id === queueId)?.tasks.some(qt => qt.id === task.id)
      ));
      
      // Update queue
      setQueues(prev => prev.map(queue => 
        queue.id === queueId ? { ...queue, tasks: [] } : queue
      ));
    } catch (err) {
      setError('Failed to clear queue');
      throw err;
    }
  };

  const filterTasks = (filters: TaskFilters): Task[] => {
    return tasks.filter(task => {
      if (filters.status && !filters.status.includes(task.status)) return false;
      if (filters.type && !filters.type.includes(task.type)) return false;
      if (filters.priority && !filters.priority.includes(task.priority)) return false;
      if (filters.agentId && task.agentId !== filters.agentId) return false;
      if (filters.dateRange) {
        const taskTime = task.startTime || task.endTime || Date.now();
        if (taskTime < filters.dateRange.start || taskTime > filters.dateRange.end) return false;
      }
      return true;
    });
  };

  const searchTasks = (query: string): Task[] => {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.id.toLowerCase().includes(lowercaseQuery) ||
      task.agentId?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const subscribeToTask = (taskId: string, callback: (task: Task) => void) => {
    if (!taskSubscriptions.has(taskId)) {
      taskSubscriptions.set(taskId, new Set());
    }
    taskSubscriptions.get(taskId)!.add(callback);
    
    return () => {
      const callbacks = taskSubscriptions.get(taskId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          taskSubscriptions.delete(taskId);
        }
      }
    };
  };

  const subscribeToQueue = (queueId: string, callback: (queue: TaskQueue) => void) => {
    if (!queueSubscriptions.has(queueId)) {
      queueSubscriptions.set(queueId, new Set());
    }
    queueSubscriptions.get(queueId)!.add(callback);
    
    return () => {
      const callbacks = queueSubscriptions.get(queueId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          queueSubscriptions.delete(queueId);
        }
      }
    };
  };

  const getTaskAnalytics = async (timeRange: string): Promise<TaskAnalytics> => {
    try {
      const response = await apiService.get(`/tasks/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (err) {
      console.error('Error loading task analytics:', err);
      throw err;
    }
  };

  const exportTasks = async (format: 'csv' | 'json') => {
    try {
      const response = await apiService.get(`/tasks/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks_export_${Date.now()}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting tasks:', err);
      throw err;
    }
  };

  const value: TaskContextType = {
    tasks,
    queues,
    stats,
    loading,
    error,
    createTask,
    cancelTask,
    retryTask,
    getTask,
    pauseQueue,
    resumeQueue,
    clearQueue,
    filterTasks,
    searchTasks,
    subscribeToTask,
    subscribeToQueue,
    getTaskAnalytics,
    exportTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};