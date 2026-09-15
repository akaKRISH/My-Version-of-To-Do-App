import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { syncUserProfile } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Handle redirect result on initial load (if signInWithRedirect was used)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          try {
            await syncUserProfile(result.user);
          } catch (syncErr) {
            console.warn('[Auth] Error syncing user profile on redirect:', syncErr);
          }
        }
      })
      .catch((err: AuthError) => {
        console.error('[Auth] Redirect sign-in error:', err);
        setError(getReadableAuthError(err));
      });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (syncErr) {
          console.warn('[Auth] Failed to sync profile to firestore:', syncErr);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.warn('[Auth] Popup failed, attempting fallback or reporting:', err);
      // If popup was blocked or iframe restriction, try redirect
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        if (err?.code === 'auth/popup-blocked') {
          try {
            await signInWithRedirect(auth, googleProvider);
            return;
          } catch (redirectErr: any) {
            setError(getReadableAuthError(redirectErr));
            return;
          }
        }
      }
      setError(getReadableAuthError(err));
    }
  };

  const logOut = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err: any) {
      console.error('[Auth] Sign out error:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        signInWithGoogle,
        logOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getReadableAuthError(err: AuthError | any): string {
  if (!err) return 'An unexpected error occurred during authentication.';
  switch (err.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. The Google popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Popups are blocked by your browser. Please enable popups or allow redirects.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request cancelled due to multiple simultaneous attempts.';
    case 'auth/network-request-failed':
      return 'Network connection lost. Please check your internet connection.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth in Firebase Authentication. Add it to Authorized Domains in the Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in your Firebase project. Enable it in the Firebase Console under Authentication > Sign-in method.';
    default:
      return err.message || 'Failed to authenticate with Google.';
  }
}
