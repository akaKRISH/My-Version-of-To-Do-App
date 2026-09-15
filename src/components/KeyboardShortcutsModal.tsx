import React from 'react';
import { X, Command, Sparkles } from 'lucide-react';
import { playPop } from '../utils/audio';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N or C', description: 'Create new task (focus title input)' },
    { key: '/', description: 'Focus search input' },
    { key: 'R', description: 'Roll Quest Dice (randomly select active task)' },
    { key: 'F', description: 'Enter Focus Arena on selected or top active task' },
    { key: 'M', description: 'Toggle sound effects on / off' },
    { key: 'G', description: 'Toggle Figma Dot Grid canvas background' },
    { key: 'I', description: 'Toggle Properties Inspector drawer' },
    { key: '?', description: 'Open this keyboard shortcuts cheat sheet' },
    { key: 'Esc', description: 'Close modals, drawers, or exit focus arena' },
  ];

  return (
    <div
      id="keyboard-shortcuts-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl space-y-5 text-stone-900">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-sm font-bold text-stone-900">
                Figma & Game Shortcuts
              </h2>
              <p className="text-[11px] text-stone-500">Quick tactile workflow commands</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playPop();
              onClose();
            }}
            aria-label="Close shortcuts"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-stone-50 transition-colors text-xs"
            >
              <span className="text-stone-600">{sc.description}</span>
              <kbd className="font-mono text-[11px] font-semibold text-stone-800 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-lg shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1 text-purple-600 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Pro-tip: Complete tasks fast to build combo streaks!
          </span>
          <button
            type="button"
            onClick={() => {
              playPop();
              onClose();
            }}
            className="px-3 py-1 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
