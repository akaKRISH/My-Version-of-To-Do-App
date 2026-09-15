import React from 'react';
import { Sparkles, Flame, Trophy, Award } from 'lucide-react';
import { UserGameStats } from '../utils/gamification';

interface GameHUDProps {
  stats: UserGameStats;
  activeCount: number;
  completedCount: number;
  totalCount: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activeCount,
  completedCount,
  totalCount,
}) => {
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      id="game-hud-bar"
      className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-stone-800 relative overflow-hidden transition-all"
    >
      {/* Subtle isometric grid pattern background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Level & Rank Badge */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-stone-950 font-black flex items-center justify-center text-base shadow-md ring-2 ring-amber-300/30">
              L{stats.level}
            </div>
            {stats.streak >= 2 && (
              <span
                id="hud-streak-flame"
                className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs animate-bounce"
                title={`${stats.streak}x Combo Streak Active!`}
              >
                <Flame className="w-2.5 h-2.5 fill-white" />
                {stats.streak}x
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Level {stats.level}
              </span>
              <span className="text-stone-500 text-xs">•</span>
              <span className="text-xs font-medium text-stone-300">
                {stats.levelTitle}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {stats.xp.toLocaleString()} <span className="text-xs font-normal text-stone-400">Total XP</span>
              </h3>
            </div>
          </div>
        </div>

        {/* XP Progress Bar to Next Level */}
        <div className="w-full md:w-56 flex-1 max-w-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Next Rank
            </span>
            <span className="font-mono text-stone-300">
              {stats.currentLevelXp} / {stats.nextLevelXp} XP ({stats.progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-stone-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Board Quest Meter */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-800 pt-3 md:pt-0 md:pl-5 w-full md:w-auto justify-between md:justify-start">
          <div>
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              Quest Completion
            </p>
            <p className="text-sm font-semibold text-stone-200 mt-0.5">
              {completedCount} of {totalCount} Done
            </p>
          </div>

          <div className="relative w-11 h-11 flex items-center justify-center">
            {/* SVG radial progress ring */}
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-500 ease-out"
                strokeDasharray={`${completionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-white font-mono">
              {completionRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
