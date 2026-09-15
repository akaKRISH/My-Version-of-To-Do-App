import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckSquare,
  Shield,
  Zap,
  HardDriveDownload,
  AlertCircle,
  Lock,
  Sparkles,
  Trophy,
  MousePointer2,
} from 'lucide-react';
import { playPop } from '../utils/audio';

export const SignInView: React.FC = () => {
  const { signInWithGoogle, error, clearError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    playPop();
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div
      id="sign-in-container"
      className="min-h-screen bg-stone-100/70 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* App Icon with Figma / Game badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-xl ring-1 ring-black/10">
              <CheckSquare className="w-9 h-9 text-stone-100" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 font-mono">
              <MousePointer2 className="w-2.5 h-2.5" />
              CANVAS
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-stone-900">
          Multi-User Tasks Canvas
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
          Figma-interactive, gamified task workspace with strict Cloud Firestore user isolation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-xl border border-stone-200 rounded-3xl sm:px-8">
          {/* Error Banner */}
          {error && (
            <div
              id="auth-error-banner"
              role="alert"
              className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Authentication Notice</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-800 text-xs font-semibold shrink-0 cursor-pointer"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Google Sign-In Action */}
          <div className="space-y-4">
            <button
              id="google-sign-in-button"
              type="button"
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-stone-300 bg-white text-stone-900 font-bold text-sm hover:bg-stone-50 hover:border-stone-400 active:bg-stone-100 transition duration-150 shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {signingIn ? (
                <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>{signingIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Interactive Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider text-center mb-4 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Canvas & Game Mechanics
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MousePointer2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Figma-Style Canvas & Properties Inspector
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Frame selections, dot grid canvas, keyboard shortcuts (<kbd className="font-mono bg-stone-100 px-1 rounded">N</kbd>, <kbd className="font-mono bg-stone-100 px-1 rounded">/</kbd>, <kbd className="font-mono bg-stone-100 px-1 rounded">R</kbd>), and schema inspector.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Gamified XP, Streaks & Focus Arena
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Level up with task XP, combo multipliers, sound synthesis, confetti cannons, and Boss Fight focus mode.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Cloud Firestore Security Rules Isolation
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Subcollection paths <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded text-[10px]">users/&#123;uid&#125;/tasks</code> guarantee cryptographically enforced private lists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security assurance footer */}
        <p className="mt-6 text-center text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-stone-400" />
          Cross-user access is blocked at the database rule layer.
        </p>
      </div>
    </div>
  );
};
