import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, CreateTaskInput, UpdateTaskInput, taskConverter } from '../types';

export function getTasksCollection(userId: string) {
  return collection(db, 'users', userId, 'tasks').withConverter(taskConverter);
}

export function getTaskDoc(userId: string, taskId: string) {
  return doc(db, 'users', userId, 'tasks', taskId).withConverter(taskConverter);
}

/**
 * Creates a new task in users/{userId}/tasks
 */
export async function createTask(userId: string, input: CreateTaskInput): Promise<string> {
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle || trimmedTitle.length > 200) {
    throw new Error('Title is required and must be between 1 and 200 characters.');
  }

  const tasksRef = getTasksCollection(userId);
  const now = serverTimestamp();

  const docRef = await addDoc(tasksRef, {
    title: trimmedTitle,
    notes: (input.notes || '').trim(),
    completed: false,
    dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
    createdAt: now,
    updatedAt: now,
  } as any);

  return docRef.id;
}

/**
 * Updates an existing task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<void> {
  const taskRef = getTaskDoc(userId, taskId);
  const updates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    if (!trimmed || trimmed.length > 200) {
      throw new Error('Title must be between 1 and 200 characters.');
    }
    updates.title = trimmed;
  }

  if (input.notes !== undefined) {
    updates.notes = input.notes.trim();
  }

  if (input.completed !== undefined) {
    updates.completed = Boolean(input.completed);
  }

  if (input.dueDate !== undefined) {
    updates.dueDate = input.dueDate ? Timestamp.fromDate(input.dueDate) : null;
  }

  await updateDoc(taskRef, updates);
}

/**
 * Toggles a task's completed state
 */
export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  currentCompleted: boolean
): Promise<void> {
  return updateTask(userId, taskId, { completed: !currentCompleted });
}

/**
 * Deletes a single task
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const taskRef = getTaskDoc(userId, taskId);
  await deleteDoc(taskRef);
}

/**
 * Clears all completed tasks for a user
 */
export async function clearCompletedTasks(userId: string, completedTaskIds: string[]): Promise<void> {
  if (!completedTaskIds.length) return;

  const batch = writeBatch(db);
  for (const id of completedTaskIds) {
    const taskRef = getTaskDoc(userId, id);
    batch.delete(taskRef);
  }
  await batch.commit();
}

/**
 * Subscribe to real-time task updates
 */
export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: Task[], fromCache: boolean) => void,
  onError: (error: Error) => void,
  maxLimit: number = 200
): Unsubscribe {
  const tasksRef = getTasksCollection(userId);
  const q = query(tasksRef, orderBy('createdAt', 'desc'), limit(maxLimit));

  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => docSnap.data());
      const fromCache = snapshot.metadata.fromCache;
      onUpdate(tasks, fromCache);
    },
    (err) => {
      console.error('[TaskService] onSnapshot error:', err);
      onError(err);
    }
  );
}
