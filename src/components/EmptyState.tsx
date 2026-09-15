import React from 'react';
import { CheckCircle2, ClipboardList, SearchX } from 'lucide-react';
import { TaskFilter } from '../types';

interface EmptyStateProps {
  filter: TaskFilter;
  hasSearchQuery: boolean;
  onClearSearch?: () => void;
  onResetFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  hasSearchQuery,
  onClearSearch,
  onResetFilter,
}) => {
  if (hasSearchQuery) {
    return (
      <div
        id="empty-search-state"
        className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200"
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mb-3">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">No matching tasks</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          We couldn't find any tasks matching your current search criteria.
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-3 text-xs text-stone-900 font-medium underline underline-offset-2 hover:text-stone-700 cursor-pointer"
          >
            Clear search term
          </button>
        )}
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div
        id="empty-completed-state"
        className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200"
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">No completed tasks yet</h3>
        <p className="text-xs text-stone-500 mt-1">
          Complete tasks by checking them off from your active task list.
        </p>
      </div>
    );
  }

  if (filter === 'active') {
    return (
      <div
        id="empty-active-state"
        className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200"
      >
        <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">All caught up!</h3>
        <p className="text-xs text-stone-500 mt-1">
          You don't have any active to-dos left. Add a new one above or relax!
        </p>
      </div>
    );
  }

  return (
    <div
      id="empty-all-state"
      className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-stone-200"
    >
      <div className="w-10 h-10 mx-auto rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
        <ClipboardList className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-stone-800">Your task list is empty</h3>
      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
        Your personal tasks are isolated and stored in your private Firestore collection. Add your first task above to get started!
      </p>
    </div>
  );
};
