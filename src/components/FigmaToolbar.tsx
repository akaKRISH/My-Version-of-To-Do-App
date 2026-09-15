import React from 'react';
import {
  MousePointer2,
  Plus,
  Target,
  Dices,
  Grid,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  HelpCircle,
} from 'lucide-react';
import { playPop } from '../utils/audio';

interface FigmaToolbarProps {
  canvasGrid: boolean;
  onToggleGrid: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onFocusTaskCreator: () => void;
  onOpenFocusArena: () => void;
  onRollDice: () => void;
  onToggleInspector: () => void;
  isInspectorOpen: boolean;
  onOpenShortcuts: () => void;
  activeCount: number;
}

export const FigmaToolbar: React.FC<FigmaToolbarProps> = ({
  canvasGrid,
  onToggleGrid,
  soundEnabled,
  onToggleSound,
  onFocusTaskCreator,
  onOpenFocusArena,
  onRollDice,
  onToggleInspector,
  isInspectorOpen,
  onOpenShortcuts,
  activeCount,
}) => {
  return (
    <nav
      id="figma-canvas-toolbar"
      aria-label="Figma workspace canvas toolbar"
      className="bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-sm rounded-2xl px-2 py-1.5 flex items-center justify-between gap-1 sm:gap-2 select-none"
    >
      {/* Left tool actions */}
      <div className="flex items-center gap-1">
        {/* Pointer Mode indicator */}
        <button
          type="button"
          id="toolbar-tool-select"
          title="Pointer tool (V)"
          className="p-2 rounded-xl bg-stone-100 text-stone-900 transition-colors cursor-default"
        >
          <MousePointer2 className="w-4 h-4" />
        </button>

        {/* Quick New Task shortcut */}
        <button
          type="button"
          id="toolbar-tool-new"
          onClick={() => {
            playPop();
            onFocusTaskCreator();
          }}
          title="Create task (N or C)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
          <span className="hidden md:inline">New Task</span>
          <kbd className="hidden lg:inline text-[10px] text-stone-400 font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-200">
            N
          </kbd>
        </button>

        <div className="h-4 w-px bg-stone-200 mx-1" />

        {/* Roll Quest Dice (Gamified random picker) */}
        <button
          type="button"
          id="toolbar-tool-dice"
          disabled={activeCount === 0}
          onClick={() => {
            playPop();
            onRollDice();
          }}
          title="Random Quest Dice: Let fate choose your next active task (R)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Dices className="w-4 h-4 text-purple-600 animate-pulse" />
          <span className="hidden sm:inline">Roll Quest</span>
          <kbd className="hidden lg:inline text-[10px] text-purple-500 font-mono bg-purple-100/70 px-1 py-0.5 rounded">
            R
          </kbd>
        </button>

        {/* Enter Focus Arena (Boss Fight Mode) */}
        <button
          type="button"
          id="toolbar-tool-focus"
          disabled={activeCount === 0}
          onClick={() => {
            playPop();
            onOpenFocusArena();
          }}
          title="Enter Focus Arena: Focused Boss Quest Mode with countdown timer (F)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-700 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Target className="w-4 h-4 text-rose-600" />
          <span className="hidden sm:inline">Focus Arena</span>
          <kbd className="hidden lg:inline text-[10px] text-rose-500 font-mono bg-rose-100/70 px-1 py-0.5 rounded">
            F
          </kbd>
        </button>
      </div>

      {/* Right canvas controls */}
      <div className="flex items-center gap-1">
        {/* Toggle Canvas Grid */}
        <button
          type="button"
          id="toolbar-toggle-grid"
          onClick={() => {
            playPop();
            onToggleGrid();
          }}
          title={`Canvas Grid: ${canvasGrid ? 'Dot Matrix' : 'Clean Blank'}`}
          className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
            canvasGrid
              ? 'bg-stone-900 text-white shadow-2xs'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Sound FX toggle */}
        <button
          type="button"
          id="toolbar-toggle-sound"
          onClick={() => {
            onToggleSound();
          }}
          title={`Sound Effects: ${soundEnabled ? 'Enabled' : 'Muted'} (M)`}
          className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Inspector drawer toggle */}
        <button
          type="button"
          id="toolbar-toggle-inspector"
          onClick={() => {
            playPop();
            onToggleInspector();
          }}
          title="Figma Properties Inspector Drawer"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            isInspectorOpen
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Inspect</span>
        </button>

        <div className="h-4 w-px bg-stone-200 mx-1" />

        {/* Keyboard Shortcuts (?) */}
        <button
          type="button"
          id="toolbar-shortcuts-help"
          onClick={() => {
            playPop();
            onOpenShortcuts();
          }}
          title="Keyboard shortcuts (?)"
          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
