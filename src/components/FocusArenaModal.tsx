import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { playPop, playSuccessChime } from '../utils/audio';

interface FocusArenaModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => Promise<void>;
  currentStreak: number;
}

export const FocusArenaModal: React.FC<FocusArenaModalProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  currentStreak,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 min default
  const [isRunning, setIsRunning] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Reset timer whenever a new task is opened
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(25 * 60);
      setIsRunning(true);
      setIsVictory(false);
    }
  }, [isOpen, task?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  if (!isOpen || !task) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleDefeatTask = async () => {
    setIsVictory(true);
    playSuccessChime(currentStreak + 1);

    // Multi-stage confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 200);

    try {
      await onComplete(task.id);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (e) {
      setIsVictory(false);
    }
  };

  return (
    <div
      id="focus-arena-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-arena-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden">
        {/* Ambient radial glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
              Focus Arena • Boss Quest
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playPop();
              onClose();
            }}
            aria-label="Exit Focus Arena"
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Task Card */}
        <div className="relative z-10 mt-6 p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Target Objective
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              #{task.id.slice(0, 6)}
            </span>
          </div>

          <h2
            id="focus-arena-heading"
            className="text-lg sm:text-xl font-bold text-white leading-snug break-words"
          >
            {task.title}
          </h2>

          {task.notes && (
            <p className="text-xs text-stone-300 line-clamp-3 break-words bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
              {task.notes}
            </p>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300/90 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due {task.dueDate.toDate().toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Timer Ring Cockpit */}
        <div className="relative z-10 my-8 flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mb-4">
            {formattedTime}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playPop();
                setIsRunning(!isRunning);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPop();
                setSecondsLeft(25 * 60);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
              title="Reset timer to 25 minutes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Big Victory Defeat Button */}
        <div className="relative z-10 space-y-3">
          <button
            type="button"
            id="focus-defeat-task-button"
            disabled={isVictory}
            onClick={handleDefeatTask}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-base shadow-lg shadow-rose-900/40 hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-80"
          >
            {isVictory ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-spin" />
                <span>VICTORY CLAIMED! +50 XP</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>COMPLETE QUEST & CLAIM XP (+50 XP)</span>
              </>
            )}
          </button>

          {currentStreak > 0 && (
            <p className="text-center text-xs text-orange-400 font-medium flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>Combo Multiplier active: {currentStreak}x current streak</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
