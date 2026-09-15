import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckSquare,
  LogOut,
  Wifi,
  WifiOff,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { UserGameStats } from '../utils/gamification';

interface NavbarProps {
  isOfflineCache: boolean;
  gameStats?: UserGameStats;
}

export const Navbar: React.FC<NavbarProps> = ({ isOfflineCache, gameStats }) => {
  const { currentUser, logOut } = useAuth();

  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header
      id="app-navbar"
      className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/10">
            <CheckSquare className="w-5 h-5 text-stone-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight truncate">
                Tasks Canvas
              </h1>
              <span
                id="security-badge"
                title="Firestore Security Rules enforce private personal isolation"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Isolated
              </span>

              {gameStats && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
                  <Trophy className="w-3 h-3 text-amber-600" />
                  LVL {gameStats.level}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block truncate">
              Multi-User Real-Time Workspace
            </p>
          </div>
        </div>

        {/* Sync Indicator & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Real-time sync status pill */}
          <div
            id="sync-status-indicator"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              isOfflineCache
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
            title={
              isOfflineCache
                ? 'Offline cache active. Writes are queued locally and will sync when reconnected.'
                : 'Connected to Firestore in real time.'
            }
          >
            {isOfflineCache ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Offline Cache</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
                <span className="hidden md:inline">Live Synced</span>
              </>
            )}
          </div>

          {/* User profile dropdown / sign out */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              {currentUser.photoURL ? (
                <img
                  id="user-avatar"
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User profile'}
                  className="w-8 h-8 rounded-full border border-stone-200 object-cover ring-1 ring-stone-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  id="user-avatar-placeholder"
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                >
                  {userInitial}
                </div>
              )}

              <div className="hidden lg:block text-left max-w-[130px] truncate">
                <p className="text-xs font-semibold text-stone-900 truncate leading-tight">
                  {currentUser.displayName || 'Architect'}
                </p>
                <p className="text-[10px] text-stone-500 truncate leading-tight">
                  {currentUser.email || currentUser.uid.slice(0, 8)}
                </p>
              </div>

              <button
                id="sign-out-button"
                onClick={logOut}
                aria-label="Sign out of account"
                title="Sign out of account"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
