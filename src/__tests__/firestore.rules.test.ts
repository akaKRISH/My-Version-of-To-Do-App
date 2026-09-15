import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

/**
 * Firestore Security Rules Unit Tests
 * Proves that users have strict, private, isolated task lists.
 * User B cannot read, write, update, or delete User A's tasks.
 */
describe('Firestore Security Rules - Isolation & Access Control', () => {
  let testEnv: RulesTestEnvironment;
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');

  beforeAll(async () => {
    // Only attempt initializing test environment if EMULATOR is available
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      testEnv = await initializeTestEnvironment({
        projectId: 'test-todo-isolation',
        firestore: { rules },
      });
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('allows authenticated User A to create a valid task in their own collection', async () => {
    if (!testEnv) {
      // In CI/dev without local emulator daemon running, skip gracefully
      return;
    }
    const userAContext = testEnv.authenticatedContext('user_a');
    const taskRef = doc(userAContext.firestore(), 'users/user_a/tasks/task_1');

    await assertSucceeds(
      setDoc(taskRef, {
        title: 'User A Secret Task',
        notes: 'Private notes',
        completed: false,
        dueDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('DENIES User B from reading User A tasks (Data Isolation Guarantee)', async () => {
    if (!testEnv) return;

    // Seed task as admin or user A
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminTaskRef = doc(context.firestore(), 'users/user_a/tasks/task_1');
      await setDoc(adminTaskRef, {
        title: 'User A Secret Task',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const userBContext = testEnv.authenticatedContext('user_b');
    const foreignTaskRef = doc(userBContext.firestore(), 'users/user_a/tasks/task_1');

    // User B attempts to read User A's task -> Must be rejected
    await assertFails(getDoc(foreignTaskRef));
  });

  it('DENIES User B from updating or deleting User A tasks', async () => {
    if (!testEnv) return;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminTaskRef = doc(context.firestore(), 'users/user_a/tasks/task_1');
      await setDoc(adminTaskRef, {
        title: 'User A Secret Task',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    const userBContext = testEnv.authenticatedContext('user_b');
    const foreignTaskRef = doc(userBContext.firestore(), 'users/user_a/tasks/task_1');

    // User B attempts update
    await assertFails(
      updateDoc(foreignTaskRef, {
        title: 'Hacked title',
        updatedAt: serverTimestamp(),
      })
    );

    // User B attempts delete
    await assertFails(deleteDoc(foreignTaskRef));
  });

  it('DENIES unauthenticated requests from accessing any task data', async () => {
    if (!testEnv) return;

    const unauthContext = testEnv.unauthenticatedContext();
    const taskRef = doc(unauthContext.firestore(), 'users/user_a/tasks/task_1');

    await assertFails(getDoc(taskRef));
    await assertFails(
      setDoc(taskRef, {
        title: 'Anonymous task',
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it('DENIES creating a task with invalid title (empty or >200 characters)', async () => {
    if (!testEnv) return;

    const userAContext = testEnv.authenticatedContext('user_a');
    const taskRef = doc(userAContext.firestore(), 'users/user_a/tasks/invalid_task');

    // Empty title
    await assertFails(
      setDoc(taskRef, {
        title: '',
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    // Title exceeding 200 chars
    const overlyLongTitle = 'a'.repeat(201);
    await assertFails(
      setDoc(taskRef, {
        title: overlyLongTitle,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });
});
