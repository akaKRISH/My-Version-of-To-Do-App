# Multi-User Real-Time Todo List (Firebase + React + TypeScript)

A production-quality multi-user task management application built with **React**, **TypeScript**, **Vite**, **Firebase Authentication (Google)**, and **Cloud Firestore**.

Each authenticated user has a completely private, isolated task collection that synchronizes in real time across devices and browser tabs, with offline multi-tab persistence and database-level security enforcement.

---

## Tech Stack Justification

- **Frontend: React 19 + TypeScript (Vite)**:
  - **Zero SSR Hydration Pitfalls**: Firestore's `persistentLocalCache` with `persistentMultipleTabManager` uses browser-native `IndexedDB`. A client-side Single-Page Application (SPA) avoids server-side hydration mismatches and complexity.
  - **Instant Hot Reloading & Build Performance**: Vite provides near-instant compilation and a lean production bundle deployable to Firebase Hosting or Cloud Run.
  - **Strict Type Safety**: Strict TypeScript interfaces and typed `FirestoreDataConverter` implementations eliminate `any` from Firestore operations.
- **Authentication**: Firebase Authentication with Google Provider (`signInWithPopup` with fallback to `signInWithRedirect`).
- **Database**: Cloud Firestore with subcollection partitioning (`users/{userId}/tasks/{taskId}`).
- **Local Development**: Firebase Emulator Suite support for both Auth and Firestore.
- **Hosting**: Firebase Hosting (`firebase.json` with SPA rewrite configuration).

---

## Data Model & Firestore Architecture

### 1. User Profile (`users/{userId}`)
```typescript
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
}
```

### 2. User Tasks Subcollection (`users/{userId}/tasks/{taskId}`)
```typescript
interface Task {
  id: string;
  title: string;           // 1 to 200 chars, trimmed, non-empty
  notes: string;           // Optional detailed notes
  completed: boolean;      // Toggle status
  dueDate: Timestamp | null;
  createdAt: Timestamp;    // serverTimestamp()
  updatedAt: Timestamp;    // serverTimestamp()
}
```

> **Why Subcollections?** Storing tasks under `users/{userId}/tasks` ties the resource ownership directly to the document path. The Firestore rules engine evaluates path wildcards (`userId == request.auth.uid`) without needing costly extra lookups (`get()` or `exists()`), making all queries fast, cheap, and strictly partition-isolated.

---

## Security Write-up: Why Cross-User Access Is Impossible

Client-side filtering is never treated as a security control. Data isolation is enforced strictly at the Cloud Firestore database rule engine.

### The Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /tasks/{taskId} {
        allow read, delete: if request.auth != null && request.auth.uid == userId;

        allow create: if request.auth != null
          && request.auth.uid == userId
          && request.resource.data.title is string
          && request.resource.data.title.size() > 0
          && request.resource.data.title.size() <= 200
          && request.resource.data.completed is bool
          && request.resource.data.createdAt == request.time;

        allow update: if request.auth != null
          && request.auth.uid == userId
          && request.resource.data.title is string
          && request.resource.data.title.size() > 0
          && request.resource.data.title.size() <= 200
          && request.resource.data.completed is bool
          && request.resource.data.updatedAt == request.time;
      }
    }
  }
}
```

### Explanation of Security Clauses

1. **Authentication Enforcement (`request.auth != null`)**:
   - Rejects all anonymous or unauthenticated network requests immediately.
2. **User Isolation Principle (`request.auth.uid == userId`)**:
   - The `{userId}` path segment in `users/{userId}/tasks/{taskId}` represents the document's partition.
   - Firestore compares the verified, cryptographically signed JWT `uid` in `request.auth` against the requested collection path.
   - Even if an attacker uses the browser console or writes a custom script with `collection(db, 'users', 'victim_uid', 'tasks')`, the request is denied with a `permission-denied` status code by the server.
   - **No Enumeration**: Collection queries must target paths the user is authorized to read. Cross-user scans fail at query compilation time.
3. **Data Integrity & Schema Validation on `create`**:
   - `request.resource.data.title is string && request.resource.data.title.size() > 0 && request.resource.data.title.size() <= 200`: Enforces character bounds directly on the database.
   - `request.resource.data.completed is bool`: Ensures status cannot be set to invalid types.
   - `request.resource.data.createdAt == request.time`: Prevents client clock spoofing by requiring the exact `serverTimestamp()`.
4. **Data Integrity & Auditability on `update`**:
   - `request.resource.data.updatedAt == request.time`: Guarantees modification timestamps reflect real server time.

---

## Real-Time Synchronization & Offline Persistence

1. **Multi-Tab IndexedDB Persistence**:
   - Initialized via `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`.
   - When offline or when the network drops, cached data remains immediately readable.
   - Offline writes are safely persisted to IndexedDB and automatically queued; when connectivity is restored, Firestore replays the mutations to the cloud and resolves conflicts via server timestamps.
2. **Real-Time Snapshot Listeners**:
   - Component state attaches to `onSnapshot` when authenticated.
   - `snapshot.metadata.fromCache` informs the user whether data is being served from local cache or live synced with Firestore.
   - Listeners cleanly unsubscribe on user sign-out and React component unmount, preventing memory leaks.

---

## Setup & Deployment Guide

### Prerequisites
- Node.js 20+
- A Google Firebase Project ([Firebase Console](https://console.firebase.google.com/))

### 1. Configure Firebase in Console
1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Enable Google Authentication**:
   - Navigate to **Authentication** > **Sign-in method**.
   - Enable **Google**.
   - Under **Authorized domains**, ensure `localhost` and your application deployment domains (e.g. `*.run.app` or custom domain) are listed.
3. **Create Cloud Firestore**:
   - Navigate to **Cloud Firestore** > **Create database**.
   - Choose your preferred region (e.g., `asia-southeast1` or `us-central1`).

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and enter your Firebase web app keys:
```bash
cp .env.example .env.local
```

Fill in values from your Firebase Project Settings:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
VITE_USE_FIREBASE_EMULATOR="false"
```

### 3. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Running with Firebase Emulator Suite
To develop and test without touching production cloud data:
```bash
# Start Firebase emulators (Auth on 9099, Firestore on 8080, UI on 4000)
firebase emulators:start

# In your .env.local:
VITE_USE_FIREBASE_EMULATOR="true"
```

### 5. Running Tests
```bash
# Run unit tests and rules validation
npm test
```

### 6. Deployment
```bash
# Build the production application
npm run build

# Deploy Firestore Security Rules
firebase deploy --only firestore:rules

# Deploy to Firebase Hosting
firebase deploy --only hosting
```
