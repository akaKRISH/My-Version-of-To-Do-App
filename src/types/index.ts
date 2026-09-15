import {
  Timestamp,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  serverTimestamp,
  FieldValue,
  WithFieldValue,
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  dueDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TaskFirestoreDoc {
  title: string;
  notes: string;
  completed: boolean;
  dueDate: Timestamp | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  dueDate?: Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string;
  completed?: boolean;
  dueDate?: Date | null;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSortBy = 'default' | 'dueDate' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

// Strict Firestore Data Converter for Tasks
export const taskConverter: FirestoreDataConverter<Task> = {
  toFirestore(task: WithFieldValue<Task>): DocumentData {
    return {
      title: typeof task.title === 'string' ? task.title.trim() : task.title,
      notes: typeof task.notes === 'string' ? task.notes.trim() : (task.notes || ''),
      completed: Boolean(task.completed),
      dueDate: task.dueDate ?? null,
      createdAt: task.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): Task {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: typeof data.title === 'string' ? data.title : '',
      notes: typeof data.notes === 'string' ? data.notes : '',
      completed: Boolean(data.completed),
      dueDate: data.dueDate instanceof Timestamp ? data.dueDate : null,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
    };
  },
};

// Strict Firestore Data Converter for UserProfile
export const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(profile: WithFieldValue<UserProfile>): DocumentData {
    return {
      uid: profile.uid,
      displayName: profile.displayName || '',
      email: profile.email || '',
      photoURL: profile.photoURL || '',
      createdAt: profile.createdAt || serverTimestamp(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): UserProfile {
    const data = snapshot.data(options);
    return {
      uid: snapshot.id,
      displayName: typeof data.displayName === 'string' ? data.displayName : '',
      email: typeof data.email === 'string' ? data.email : '',
      photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
    };
  },
};
