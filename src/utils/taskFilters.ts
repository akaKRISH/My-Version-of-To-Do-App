import { Task, TaskFilter, TaskSortBy, SortOrder } from '../types';

/**
 * Pure functions for task filtering, searching, and sorting.
 */
export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  searchQuery: string = ''
): Task[] {
  const query = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    // 1. Status Filter
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;

    // 2. Search query filter
    if (query) {
      const titleMatch = task.title.toLowerCase().includes(query);
      const notesMatch = task.notes.toLowerCase().includes(query);
      if (!titleMatch && !notesMatch) return false;
    }

    return true;
  });
}

export function sortTasks(
  tasks: Task[],
  sortBy: TaskSortBy,
  sortOrder: SortOrder = 'desc'
): Task[] {
  const copy = [...tasks];

  copy.sort((a, b) => {
    if (sortBy === 'default') {
      // Completed status first: incomplete (false) before completed (true)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then newest creation date first
      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    }

    if (sortBy === 'createdAt') {
      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    if (sortBy === 'dueDate') {
      // Tasks without due date placed at the end
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const timeA = a.dueDate.toMillis();
      const timeB = b.dueDate.toMillis();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    if (sortBy === 'title') {
      const comp = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? comp : -comp;
    }

    return 0;
  });

  return copy;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  isOfflineCache: boolean;
  error: string | null;
}

export type TaskAction =
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; fromCache: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'OPTIMISTIC_TOGGLE'; payload: { taskId: string } }
  | { type: 'OPTIMISTIC_DELETE'; payload: { taskId: string } };

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        isOfflineCache: action.payload.fromCache,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'OPTIMISTIC_TOGGLE':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    case 'OPTIMISTIC_DELETE':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };
    default:
      return state;
  }
}
