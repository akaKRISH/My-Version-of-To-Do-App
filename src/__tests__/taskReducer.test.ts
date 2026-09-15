import { describe, it, expect } from 'vitest';
import {
  filterTasks,
  sortTasks,
  taskReducer,
  TaskState,
} from '../utils/taskFilters';
import { Task } from '../types';
import { Timestamp } from 'firebase/firestore';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Buy groceries',
    notes: 'Milk, eggs, sourdough bread',
    completed: false,
    dueDate: Timestamp.fromMillis(1700000000000),
    createdAt: Timestamp.fromMillis(1000),
    updatedAt: Timestamp.fromMillis(1000),
  },
  {
    id: 'task-2',
    title: 'Schedule team sync',
    notes: 'Coordinate via calendar invite',
    completed: true,
    dueDate: Timestamp.fromMillis(1690000000000),
    createdAt: Timestamp.fromMillis(2000),
    updatedAt: Timestamp.fromMillis(2500),
  },
  {
    id: 'task-3',
    title: 'Review pull request',
    notes: '',
    completed: false,
    dueDate: null,
    createdAt: Timestamp.fromMillis(3000),
    updatedAt: Timestamp.fromMillis(3000),
  },
];

describe('Task Filters and Search', () => {
  it('filters all tasks', () => {
    const result = filterTasks(mockTasks, 'all');
    expect(result).toHaveLength(3);
  });

  it('filters active tasks', () => {
    const result = filterTasks(mockTasks, 'active');
    expect(result).toHaveLength(2);
    expect(result.every((t) => !t.completed)).toBe(true);
  });

  it('filters completed tasks', () => {
    const result = filterTasks(mockTasks, 'completed');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('task-2');
  });

  it('filters by search term in title', () => {
    const result = filterTasks(mockTasks, 'all', 'groceries');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('task-1');
  });

  it('filters by search term in notes', () => {
    const result = filterTasks(mockTasks, 'all', 'sourdough');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('task-1');
  });
});

describe('Task Sorting', () => {
  it('sorts by default: active tasks first, then newest creation date', () => {
    const sorted = sortTasks(mockTasks, 'default');
    // Active tasks: task-3 (created 3000), task-1 (created 1000)
    // Completed task: task-2
    expect(sorted[0].id).toBe('task-3');
    expect(sorted[1].id).toBe('task-1');
    expect(sorted[2].id).toBe('task-2');
  });

  it('sorts by title alphabetically ascending and descending', () => {
    const asc = sortTasks(mockTasks, 'title', 'asc');
    expect(asc[0].title).toBe('Buy groceries');
    expect(asc[2].title).toBe('Schedule team sync');

    const desc = sortTasks(mockTasks, 'title', 'desc');
    expect(desc[0].title).toBe('Schedule team sync');
    expect(desc[2].title).toBe('Buy groceries');
  });
});

describe('Task Reducer State Transitions', () => {
  const initialState: TaskState = {
    tasks: mockTasks,
    loading: false,
    isOfflineCache: false,
    error: null,
  };

  it('handles OPTIMISTIC_TOGGLE to invert completed flag immediately', () => {
    const nextState = taskReducer(initialState, {
      type: 'OPTIMISTIC_TOGGLE',
      payload: { taskId: 'task-1' },
    });
    const task1 = nextState.tasks.find((t) => t.id === 'task-1');
    expect(task1?.completed).toBe(true);
  });

  it('handles OPTIMISTIC_DELETE to remove task from array', () => {
    const nextState = taskReducer(initialState, {
      type: 'OPTIMISTIC_DELETE',
      payload: { taskId: 'task-2' },
    });
    expect(nextState.tasks.find((t) => t.id === 'task-2')).toBeUndefined();
    expect(nextState.tasks).toHaveLength(2);
  });

  it('handles SET_TASKS updating cache flag and clearing error', () => {
    const nextState = taskReducer(
      { ...initialState, error: 'Previous error' },
      {
        type: 'SET_TASKS',
        payload: { tasks: [], fromCache: true },
      }
    );
    expect(nextState.tasks).toHaveLength(0);
    expect(nextState.isOfflineCache).toBe(true);
    expect(nextState.error).toBeNull();
  });
});
