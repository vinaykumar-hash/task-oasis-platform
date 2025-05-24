
import { create } from 'zustand';

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'expired';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'bug' | 'feature' | 'improvement';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId: string;
  assigneeName: string;
  organizationId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByOrganization: (organizationId: string) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  checkExpiredTasks: () => void;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix login bug',
    description: 'Users are unable to login with special characters in password',
    status: 'todo',
    priority: 'high',
    category: 'bug',
    assigneeId: '3',
    assigneeName: 'Mike Member',
    organizationId: 'org1',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Implement dark mode',
    description: 'Add dark mode toggle to the application',
    status: 'in-progress',
    priority: 'medium',
    category: 'feature',
    assigneeId: '2',
    assigneeName: 'Sarah Manager',
    organizationId: 'org1',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Optimize database queries',
    description: 'Improve performance of user dashboard queries',
    status: 'completed',
    priority: 'medium',
    category: 'improvement',
    assigneeId: '1',
    assigneeName: 'John Admin',
    organizationId: 'org1',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set(state => ({
      tasks: [...state.tasks, newTask]
    }));
  },

  updateTask: (id, updates) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    }));
  },

  deleteTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }));
  },

  getTasksByOrganization: (organizationId) => {
    return get().tasks.filter(task => task.organizationId === organizationId);
  },

  getTasksByAssignee: (assigneeId) => {
    return get().tasks.filter(task => task.assigneeId === assigneeId);
  },

  checkExpiredTasks: () => {
    const now = new Date();
    set(state => ({
      tasks: state.tasks.map(task => {
        if (new Date(task.dueDate) < now && task.status !== 'completed' && task.status !== 'expired') {
          return { ...task, status: 'expired' as TaskStatus, updatedAt: new Date().toISOString() };
        }
        return task;
      })
    }));
  }
}));

// Simulate background job for checking expired tasks
setInterval(() => {
  useTaskStore.getState().checkExpiredTasks();
}, 60000); // Check every minute
