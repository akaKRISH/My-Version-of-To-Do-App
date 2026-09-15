import { useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  Task,
  TaskFilter,
  TaskSortBy,
  SortOrder,
  CreateTaskInput,
  UpdateTaskInput,
} from '../types';
import {
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  clearCompletedTasks,
  subscribeToTasks,
} from '../services/taskService';
import {
  taskReducer,
  filterTasks,
  sortTasks,
  TaskState,
} from '../utils/taskFilters';

const initialState: TaskState = {
  tasks: [],
  loading: true,
  isOfflineCache: false,
  error: null,
};

export function useTasks(user: User | null) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('default');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscribe to real-time updates when user is authenticated
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_TASKS', payload: { tasks: [], fromCache: false } });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const unsubscribe = subscribeToTasks(
      user.uid,
      (tasks, fromCache) => {
        dispatch({ type: 'SET_TASKS', payload: { tasks, fromCache } });
      },
      (err: any) => {
        let msg = 'Failed to synchronize tasks in real time.';
        if (err.code === 'permission-denied') {
          msg = 'Permission denied: Cannot access task list. Security rules rejected this request.';
        } else if (err.code === 'unavailable') {
          msg = 'Firestore service currently unavailable. Operating in offline cache mode.';
        }
        dispatch({ type: 'SET_ERROR', payload: msg });
      }
    );

    // Unsubscribe cleanly on sign-out or unmount
    return () => {
      unsubscribe();
    };
  }, [user]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Handlers with optimistic UI updates and error reversion
  const handleCreate = async (input: CreateTaskInput) => {
    if (!user) return;
    try {
      await createTask(user.uid, input);
    } catch (err: any) {
      console.error('[useTasks] Error creating task:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to create task. Please try again.',
      });
      throw err;
    }
  };

  const handleToggle = async (taskId: string, currentCompleted: boolean) => {
    if (!user) return;
    // Optimistic toggle
    dispatch({ type: 'OPTIMISTIC_TOGGLE', payload: { taskId } });

    try {
      await toggleTaskCompletion(user.uid, taskId, currentCompleted);
    } catch (err: any) {
      console.error('[useTasks] Error toggling task:', err);
      // Revert optimistic update
      dispatch({ type: 'OPTIMISTIC_TOGGLE', payload: { taskId } });
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to update task status. Please check your connection.',
      });
    }
  };

  const handleUpdate = async (taskId: string, input: UpdateTaskInput) => {
    if (!user) return;
    try {
      await updateTask(user.uid, taskId, input);
    } catch (err: any) {
      console.error('[useTasks] Error updating task:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to update task.',
      });
      throw err;
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!user) return;
    // Optimistic delete
    dispatch({ type: 'OPTIMISTIC_DELETE', payload: { taskId } });

    try {
      await deleteTask(user.uid, taskId);
    } catch (err: any) {
      console.error('[useTasks] Error deleting task:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to delete task. Changes will re-sync with the server.',
      });
    }
  };

  const handleClearCompleted = async () => {
    if (!user) return;
    const completedIds = state.tasks
      .filter((t) => t.completed)
      .map((t) => t.id);

    if (completedIds.length === 0) return;

    try {
      await clearCompletedTasks(user.uid, completedIds);
    } catch (err: any) {
      console.error('[useTasks] Error clearing completed tasks:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to clear completed tasks.',
      });
    }
  };

  // Compute stats
  const counts = useMemo(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  }, [state.tasks]);

  // Compute filtered & sorted list
  const filteredTasks = useMemo(() => {
    const filtered = filterTasks(state.tasks, filter, searchQuery);
    return sortTasks(filtered, sortBy, sortOrder);
  }, [state.tasks, filter, searchQuery, sortBy, sortOrder]);

  return {
    tasks: state.tasks,
    filteredTasks,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    loading: state.loading,
    isOfflineCache: state.isOfflineCache,
    error: state.error,
    clearError,
    handleCreate,
    handleToggle,
    handleUpdate,
    handleDelete,
    handleClearCompleted,
    counts,
  };
}
