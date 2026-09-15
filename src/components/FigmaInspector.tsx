import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calendar,
  Layers,
  FileCode,
  Target,
  Pencil,
  Trash2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Task } from '../types';
import { playPop } from '../utils/audio';

interface FigmaInspectorProps {
  task: Task | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (taskId: string, currentCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenFocusArena: (task: Task) => void;
}

export const FigmaInspector: React.FC<FigmaInspectorProps> = ({
  task,
  userId,
  isOpen,
  onClose,
  onToggle,
  onEdit,
  onDelete,
  onOpenFocusArena,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    if (!task) return;
    const path = `users/${userId}/tasks/${task.id}`;
    navigator.clipboard?.writeText(path);
    playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      id="figma-properties-inspector"
      aria-label="Figma Properties Inspector"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 bg-white border-l border-stone-200 shadow-xl flex flex-col transition-all duration-200 ease-out select-none"
    >
      {/* Inspector Header */}
      <div className="h-14 px-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Inspector
          </h3>
          {task && (
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded">
              #{task.id.slice(0, 6)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            playPop();
            onClose();
          }}
          aria-label="Close inspector"
          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {!task ? (
          <div className="text-center py-16 text-stone-400 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-medium text-xs">No Task Selected</p>
            <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
              Click any task item on the canvas to inspect its schema properties and telemetry.
            </p>
          </div>
        ) : (
          <>
            {/* Task Layer Overview */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Selected Element
              </label>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <p className="font-semibold text-stone-900 text-sm break-words select-text">
                  {task.title}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                  <span>Status:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      task.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.completed ? 'Completed' : 'Active Quest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Interactive Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    onToggle(task.id, task.completed);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium transition-colors cursor-pointer ${
                    task.completed
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{task.completed ? 'Mark Active' : 'Complete'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    onOpenFocusArena(task);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-medium transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Focus Arena</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    onEdit(task);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Layer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    onDelete(task);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Geometry & Text Metrics */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Metrics & Geometry
              </label>
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-mono text-[11px]">
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Chars:</span>
                  <span className="font-semibold text-stone-800">
                    {task.title.length} / 200
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Words:</span>
                  <span className="font-semibold text-stone-800">
                    {task.title.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Notes:</span>
                  <span className="font-semibold text-stone-800">
                    {task.notes ? `${task.notes.length}c` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="text-stone-400">Due:</span>
                  <span className="font-semibold text-stone-800">
                    {task.dueDate?.toDate?.()
                      ? task.dueDate.toDate().toLocaleDateString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                        })
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Firestore Partition Document Reference */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  Firestore Document
                </label>
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Path'}
                </button>
              </div>

              <div className="p-2.5 bg-stone-900 text-stone-200 rounded-xl font-mono text-[10px] break-all border border-stone-800">
                <p className="text-stone-400">// Strict user isolation</p>
                <p className="text-emerald-400 mt-1">users/{userId}/tasks/{task.id}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Protected by Firestore Security Rules</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Created:
                </span>
                <span className="font-mono text-stone-700">
                  {task.createdAt?.toDate?.()
                    ? task.createdAt.toDate().toLocaleString()
                    : 'Syncing...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Last Updated:
                </span>
                <span className="font-mono text-stone-700">
                  {task.updatedAt?.toDate?.()
                    ? task.updatedAt.toDate().toLocaleString()
                    : 'Syncing...'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
