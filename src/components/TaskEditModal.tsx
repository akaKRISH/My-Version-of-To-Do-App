import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlignLeft, Loader2 } from 'lucide-react';
import { Task, UpdateTaskInput } from '../types';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, input: UpdateTaskInput) => Promise<void>;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      if (task.dueDate) {
        const d = task.dueDate.toDate();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setDueDateStr(`${year}-${month}-${day}`);
      } else {
        setDueDateStr('');
      }
      setError(null);
    }
  }, [task, isOpen]);

  // Focus title input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError('Title cannot be empty.');
      return;
    }
    if (trimmed.length > 200) {
      setError('Title cannot exceed 200 characters.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const dueDate = dueDateStr ? new Date(dueDateStr + 'T23:59:59') : null;
      await onSave(task.id, {
        title: trimmed,
        notes: notes.trim(),
        dueDate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="edit-task-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="edit-task-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-modal-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <h3
            id="edit-task-modal-title"
            className="text-sm font-semibold text-stone-900"
          >
            Edit Task
          </h3>
          <button
            type="button"
            id="close-edit-modal-button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              id="edit-task-error-alert"
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium"
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="edit-task-title-input"
                className="text-xs font-semibold text-stone-700"
              >
                Task Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400">
                {title.length}/200
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="edit-task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="edit-task-due-date"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              Due Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                id="edit-task-due-date"
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer"
              />
            </div>
            {dueDateStr && (
              <button
                type="button"
                onClick={() => setDueDateStr('')}
                className="text-[11px] text-stone-500 hover:text-stone-800 mt-1 cursor-pointer"
              >
                Clear due date
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-stone-500" />
              <label
                htmlFor="edit-task-notes-input"
                className="text-xs font-semibold text-stone-700"
              >
                Notes & Checklist (Optional)
              </label>
            </div>
            <textarea
              id="edit-task-notes-input"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              placeholder="Additional details, URLs, or notes..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              id="cancel-edit-button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-edit-button"
              disabled={saving || !title.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 active:bg-stone-950 transition-colors shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
