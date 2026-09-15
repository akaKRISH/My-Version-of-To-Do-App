import React from 'react';
import {
  Check,
  Calendar,
  AlignLeft,
  Pencil,
  Trash2,
  Clock,
  AlertCircle,
  Target,
} from 'lucide-react';
import { Task } from '../types';
import { playPop } from '../utils/audio';

interface TaskItemProps {
  task: Task;
  index: number;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  onToggle: (taskId: string, currentCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenFocusArena: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isSelected,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onOpenFocusArena,
}) => {
  // Format due date badge & check overdue
  const dueDateInfo = React.useMemo(() => {
    if (!task.dueDate) return null;
    const date = task.dueDate.toDate();
    const now = new Date();

    const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const isOverdue = targetDay.getTime() < today.getTime() && !task.completed;
    const isToday = targetDay.getTime() === today.getTime();
    const isTomorrow = targetDay.getTime() === tomorrow.getTime();

    let label = targetDay.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    if (isToday) label = 'Today';
    if (isTomorrow) label = 'Tomorrow';

    return { label, isOverdue, isToday };
  }, [task.dueDate, task.completed]);

  const handleKeyDownCheckbox = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(task.id, task.completed);
    }
  };

  return (
    <div
      id={`task-item-${task.id}`}
      onClick={() => onSelect(task)}
      className={`group relative flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/80 z-10'
          : task.completed
          ? 'bg-stone-50/70 border-stone-200/70 text-stone-400 hover:border-stone-300'
          : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Figma Selection Corner Nodes when selected */}
      {isSelected && (
        <>
          <span className="w-2 h-2 bg-white border border-blue-600 absolute -top-1 -left-1 rounded-xs pointer-events-none" />
          <span className="w-2 h-2 bg-white border border-blue-600 absolute -top-1 -right-1 rounded-xs pointer-events-none" />
          <span className="w-2 h-2 bg-white border border-blue-600 absolute -bottom-1 -left-1 rounded-xs pointer-events-none" />
          <span className="w-2 h-2 bg-white border border-blue-600 absolute -bottom-1 -right-1 rounded-xs pointer-events-none" />

          {/* Figma Layer Index Pill */}
          <span className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow-xs pointer-events-none tracking-wider uppercase">
            Frame #{index + 1}
          </span>
        </>
      )}

      {/* Checkbox and Content */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Accessible Gamified Checkbox */}
        <button
          type="button"
          role="checkbox"
          id={`task-checkbox-${task.id}`}
          aria-checked={task.completed}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id, task.completed);
          }}
          onKeyDown={handleKeyDownCheckbox}
          className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer active:scale-90 ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'border-stone-300 hover:border-emerald-500 bg-white text-transparent hover:scale-105'
          }`}
        >
          <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'block' : 'hidden'}`} />
        </button>

        {/* Task Details */}
        <div className="min-w-0 flex-1">
          <p
            id={`task-title-${task.id}`}
            className={`text-sm font-medium leading-snug break-words transition-all select-text ${
              task.completed
                ? 'line-through text-stone-400'
                : 'text-stone-900 font-medium'
            }`}
          >
            {task.title}
          </p>

          {/* Optional Notes Preview */}
          {task.notes && (
            <p
              id={`task-notes-${task.id}`}
              className={`text-xs mt-1 leading-relaxed line-clamp-2 break-words ${
                task.completed ? 'text-stone-400/80' : 'text-stone-500'
              }`}
            >
              {task.notes}
            </p>
          )}

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Due date badge */}
            {dueDateInfo && (
              <span
                id={`task-due-${task.id}`}
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                  task.completed
                    ? 'bg-stone-100 text-stone-400'
                    : dueDateInfo.isOverdue
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : dueDateInfo.isToday
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {dueDateInfo.isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-red-600" />
                ) : (
                  <Calendar className="w-3 h-3 text-stone-500" />
                )}
                <span>Due {dueDateInfo.label}</span>
              </span>
            )}

            {/* Notes Indicator if note exists */}
            {task.notes && (
              <span
                id={`task-notes-indicator-${task.id}`}
                title="Has attached notes"
                className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md text-stone-400 bg-stone-100/80"
              >
                <AlignLeft className="w-3 h-3" />
                <span>Note</span>
              </span>
            )}

            {/* Creation timestamp */}
            <span
              id={`task-created-${task.id}`}
              className="text-[10px] text-stone-400 inline-flex items-center gap-1"
            >
              <Clock className="w-2.5 h-2.5" />
              {task.createdAt?.toDate?.() ? task.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons (Focus Arena, Edit & Delete) */}
      <div
        className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-90 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Launch in Focus Arena (Boss Quest) */}
        {!task.completed && (
          <button
            type="button"
            id={`task-focus-button-${task.id}`}
            onClick={() => {
              playPop();
              onOpenFocusArena(task);
            }}
            aria-label={`Enter focus arena for: ${task.title}`}
            title="Enter Focus Arena (Boss Quest Mode)"
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          id={`task-edit-button-${task.id}`}
          onClick={() => {
            playPop();
            onEdit(task);
          }}
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
          className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          id={`task-delete-button-${task.id}`}
          onClick={() => {
            playPop();
            onDelete(task);
          }}
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
          className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
