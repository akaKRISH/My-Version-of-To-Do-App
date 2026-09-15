import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTasks } from './hooks/useTasks';
import { Navbar } from './components/Navbar';
import { SignInView } from './components/SignInView';
import { TaskForm } from './components/TaskForm';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskItem } from './components/TaskItem';
import { TaskEditModal } from './components/TaskEditModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { TaskSkeleton } from './components/TaskSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorAlert } from './components/ErrorAlert';
import { SecurityInspector } from './components/SecurityInspector';
import { GameHUD } from './components/GameHUD';
import { FigmaToolbar } from './components/FigmaToolbar';
import { FigmaInspector } from './components/FigmaInspector';
import { FocusArenaModal } from './components/FocusArenaModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Task } from './types';
import { CheckSquare, Flame } from 'lucide-react';
import {
  isSoundEnabled,
  toggleSound,
  playPop,
  playSuccessChime,
  playLevelUpFanfare,
  playDeleteSwoosh,
  playDiceTick,
} from './utils/audio';
import {
  getStoredStats,
  awardTaskCompletion,
  UserGameStats,
} from './utils/gamification';

function Dashboard() {
  const { currentUser } = useAuth();
  const {
    filteredTasks,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    loading,
    isOfflineCache,
    error,
    clearError,
    handleCreate,
    handleToggle,
    handleUpdate,
    handleDelete,
    handleClearCompleted,
    counts,
  } = useTasks(currentUser);

  // References for keyboard shortcuts
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Gamification stats
  const [gameStats, setGameStats] = useState<UserGameStats>(() =>
    getStoredStats(currentUser?.uid || 'guest')
  );

  // Floating XP toast notification
  const [xpToast, setXpToast] = useState<{ xp: number; combo: number } | null>(null);

  // Level up banner
  const [levelUpNotice, setLevelUpNotice] = useState<string | null>(null);

  // Sound state
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);

  // Figma Dot Grid background
  const [canvasGrid, setCanvasGrid] = useState<boolean>(true);

  // Selected task for Figma inspection
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Focus Arena / Boss Fight Mode
  const [focusArenaTask, setFocusArenaTask] = useState<Task | null>(null);
  const [isFocusArenaOpen, setIsFocusArenaOpen] = useState<boolean>(false);

  // Keyboard Shortcuts Modal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Edit modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Single delete confirmation state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear completed confirmation state
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Sync game stats on user change
  useEffect(() => {
    if (currentUser?.uid) {
      setGameStats(getStoredStats(currentUser.uid));
    }
  }, [currentUser?.uid]);

  const selectedTask =
    filteredTasks.find((t) => t.id === selectedTaskId) ||
    filteredTasks[0] ||
    null;

  // Sound toggle handler
  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  // Gamified Task Completion Toggle with Confetti & XP Fanfare
  const handleGamifiedToggle = async (taskId: string, currentCompleted: boolean) => {
    const willComplete = !currentCompleted;

    if (willComplete && currentUser?.uid) {
      // Award XP and calculate combo
      const outcome = awardTaskCompletion(currentUser.uid);
      setGameStats(outcome.stats);
      setXpToast({ xp: outcome.gainedXp, combo: outcome.combo });
      setTimeout(() => setXpToast(null), 2500);

      playSuccessChime(outcome.combo);

      // Trigger multi-confetti celebration
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
      });

      if (outcome.leveledUp) {
        playLevelUpFanfare();
        setLevelUpNotice(`Level Up! You reached Level ${outcome.stats.level}: ${outcome.stats.levelTitle}!`);
        setTimeout(() => setLevelUpNotice(null), 4000);
      }
    } else {
      playPop();
    }

    await handleToggle(taskId, currentCompleted);
  };

  // Roll Random Quest Dice Roulette
  const handleRollDice = () => {
    const activeTasks = filteredTasks.filter((t) => !t.completed);
    if (activeTasks.length === 0) return;

    let iterations = 0;
    const maxIterations = Math.min(12, activeTasks.length * 3);
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * activeTasks.length);
      const chosen = activeTasks[randomIndex];
      setSelectedTaskId(chosen.id);
      playDiceTick();
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        playSuccessChime(1);
        setIsInspectorOpen(true);
      }
    }, 90);
  };

  // Open Focus Arena
  const handleOpenFocusArena = (task?: Task) => {
    const target = task || selectedTask || filteredTasks.find((t) => !t.completed);
    if (target) {
      setFocusArenaTask(target);
      setIsFocusArenaOpen(true);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        titleInputRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRollDice();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleOpenFocusArena();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setCanvasGrid((prev) => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setIsInspectorOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFocusArenaOpen(false);
        setIsShortcutsOpen(false);
        setIsInspectorOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTasks, selectedTask]);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    playDeleteSwoosh();
    try {
      await handleDelete(deletingTask.id);
      if (selectedTaskId === deletingTask.id) {
        setSelectedTaskId(null);
      }
      setIsDeleteModalOpen(false);
      setDeletingTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmClearCompleted = async () => {
    setIsClearing(true);
    playDeleteSwoosh();
    try {
      await handleClearCompleted();
      setIsClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className={`min-h-screen text-stone-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors ${
        canvasGrid
          ? 'bg-stone-100/70'
          : 'bg-stone-50'
      }`}
      style={
        canvasGrid
          ? {
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }
          : undefined
      }
    >
      {/* Top Navigation */}
      <Navbar isOfflineCache={isOfflineCache} gameStats={gameStats} />

      {/* Floating XP Gain Badge Toast */}
      {xpToast && (
        <div
          id="xp-floating-toast"
          className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 animate-in slide-in-from-top duration-200"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-sm text-amber-300">
            +{xpToast.xp} XP
          </span>
          {xpToast.combo > 1 && (
            <span className="text-xs text-orange-400 font-semibold flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-orange-400" />
              {xpToast.combo}x Combo!
            </span>
          )}
        </div>
      )}

      {/* Level Up Celebration Banner */}
      {levelUpNotice && (
        <div
          id="level-up-banner"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-in zoom-in-95 duration-200"
        >
          <span>🎉</span>
          <span>{levelUpNotice}</span>
        </div>
      )}

      {/* Main Workspace Canvas Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error Alert */}
        <ErrorAlert message={error} onDismiss={clearError} />

        {/* Game HUD Bar: Level, XP Bar, Quest Ring, Streak */}
        <section aria-label="Player level and game status HUD">
          <GameHUD
            stats={gameStats}
            activeCount={counts.active}
            completedCount={counts.completed}
            totalCount={counts.total}
          />
        </section>

        {/* Figma Interactive Canvas Toolbar */}
        <section aria-label="Figma canvas tools">
          <FigmaToolbar
            canvasGrid={canvasGrid}
            onToggleGrid={() => setCanvasGrid(!canvasGrid)}
            soundEnabled={soundOn}
            onToggleSound={handleToggleSound}
            onFocusTaskCreator={() => titleInputRef.current?.focus()}
            onOpenFocusArena={() => handleOpenFocusArena()}
            onRollDice={handleRollDice}
            onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
            isInspectorOpen={isInspectorOpen}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            activeCount={counts.active}
          />
        </section>

        {/* Task Creation Card */}
        <section aria-labelledby="create-task-heading">
          <h2 id="create-task-heading" className="sr-only">
            Create new task
          </h2>
          <TaskForm onSubmit={handleCreate} inputRef={titleInputRef} />
        </section>

        {/* Task Controls & Filtering */}
        <section aria-label="Task filters and controls">
          <TaskFilterBar
            currentFilter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onToggleSortOrder={() =>
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            }
            counts={counts}
            onClearCompleted={() => setIsClearModalOpen(true)}
            searchInputRef={searchInputRef}
          />
        </section>

        {/* Interactive Task Canvas List */}
        <section aria-label="Tasks canvas layer list" className="space-y-2.5">
          {loading ? (
            <TaskSkeleton />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              filter={filter}
              hasSearchQuery={Boolean(searchQuery)}
              onClearSearch={() => setSearchQuery('')}
              onResetFilter={() => setFilter('all')}
            />
          ) : (
            <div
              id="tasks-container"
              className="space-y-2.5"
              role="list"
              aria-label="User task list"
            >
              {filteredTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  isSelected={selectedTaskId === task.id}
                  onSelect={(t) => {
                    setSelectedTaskId(t.id);
                    playPop();
                  }}
                  onToggle={handleGamifiedToggle}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onOpenFocusArena={handleOpenFocusArena}
                />
              ))}
            </div>
          )}
        </section>

        {/* Security & Data Partitioning Verification Inspector */}
        <section aria-label="Security and isolation status" className="pt-4">
          <SecurityInspector />
        </section>
      </main>

      {/* Figma Properties Inspector Drawer */}
      <FigmaInspector
        task={selectedTask}
        userId={currentUser?.uid || 'guest'}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onToggle={handleGamifiedToggle}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onOpenFocusArena={handleOpenFocusArena}
      />

      {/* Focus Arena / Boss Quest Modal */}
      <FocusArenaModal
        task={focusArenaTask}
        isOpen={isFocusArenaOpen}
        onClose={() => setIsFocusArenaOpen(false)}
        onComplete={async (taskId) => {
          await handleGamifiedToggle(taskId, false);
        }}
        currentStreak={gameStats.streak}
      />

      {/* Figma Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Edit Task Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleUpdate}
      />

      {/* Single Task Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        isProcessing={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* Clear All Completed Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        title="Clear All Completed Tasks"
        description={`This will permanently remove ${counts.completed} completed task${
          counts.completed === 1 ? '' : 's'
        }. Are you sure you want to proceed?`}
        confirmLabel={`Clear ${counts.completed} Tasks`}
        isProcessing={isClearing}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearCompleted}
      />
    </div>
  );
}

function AuthConsumer() {
  const { currentUser, loading } = useAuth();

  // Show clean loading state while auth resolves so protected UI never flashes
  if (loading) {
    return (
      <div
        id="auth-loading-screen"
        className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4"
        aria-live="polite"
      >
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-md animate-pulse">
          <CheckSquare className="w-6 h-6 text-stone-100" />
        </div>
        <p className="mt-4 text-xs font-medium text-stone-500">
          Initializing secure workspace...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <SignInView />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}
