import React, { useState } from 'react';
import { Plus, Calendar, AlignLeft, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { CreateTaskInput } from '../types';
import { playPop } from '../utils/audio';

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, inputRef }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setValidationError('Task title cannot be empty.');
      return;
    }
    if (trimmed.length > 200) {
      setValidationError('Task title cannot exceed 200 characters.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    try {
      const dueDate = dueDateStr ? new Date(dueDateStr + 'T23:59:59') : null;
      await onSubmit({
        title: trimmed,
        notes: notes.trim(),
        dueDate,
      });

      playPop();

      // Reset form
      setTitle('');
      setNotes('');
      setDueDateStr('');
      setIsExpanded(false);
    } catch (err) {
      // Error handled by parent hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isExpanded) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      id="task-create-container"
      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs transition-all hover:shadow-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Title Input Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="new-task-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleTitleKeyDown}
              placeholder="What quest needs to be completed? (Press 'N')"
              maxLength={200}
              aria-label="New task title"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'task-title-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50/50 transition-colors focus:bg-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                validationError
                  ? 'border-red-300 focus-visible:ring-red-400'
                  : 'border-stone-200'
              }`}
            />
            {title.length > 0 && (
              <span className="absolute right-3 top-2.5 text-[11px] text-stone-400 pointer-events-none font-mono">
                {title.length}/200
              </span>
            )}
          </div>

          <button
            type="submit"
            id="create-task-button"
            disabled={submitting || !title.trim()}
            aria-label="Add task"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 active:bg-stone-950 transition-colors shrink-0 shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Validation error message */}
        {validationError && (
          <p
            id="task-title-error"
            role="alert"
            className="text-xs text-red-600 font-medium px-1"
          >
            {validationError}
          </p>
        )}

        {/* Secondary options toolbar (Expand notes / Due date / Enter hint) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Expand Notes Toggle */}
            <button
              type="button"
              id="toggle-notes-button"
              onClick={() => {
                playPop();
                setIsExpanded(!isExpanded);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isExpanded || notes
                  ? 'bg-stone-200/80 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Notes {notes ? '(added)' : ''}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            {/* Due date input */}
            <div className="flex items-center gap-1">
              <label
                htmlFor="new-task-due-date"
                className="text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Due:</span>
                <input
                  id="new-task-due-date"
                  type="date"
                  value={dueDateStr}
                  onChange={(e) => setDueDateStr(e.target.value)}
                  className="text-xs text-stone-700 bg-transparent border-none p-0 focus:outline-hidden cursor-pointer"
                />
              </label>
              {dueDateStr && (
                <button
                  type="button"
                  onClick={() => setDueDateStr('')}
                  aria-label="Clear due date"
                  className="text-stone-400 hover:text-stone-600 text-xs px-1 cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <span className="text-[11px] text-stone-400 hidden sm:inline flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Press <kbd className="font-mono bg-stone-100 px-1 py-0.5 rounded border border-stone-200 text-[10px]">Enter</kbd> to add
          </span>
        </div>

        {/* Collapsible Notes Field */}
        {isExpanded && (
          <div className="pt-2 animate-in fade-in duration-150">
            <label htmlFor="new-task-notes" className="sr-only">
              Task Notes
            </label>
            <textarea
              id="new-task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional notes, requirements, or checklist items..."
              rows={3}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        )}
      </form>
    </div>
  );
};
