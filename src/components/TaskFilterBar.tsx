import React from 'react';
import { Search, ArrowUpDown, Trash2, X } from 'lucide-react';
import { TaskFilter, TaskSortBy, SortOrder } from '../types';
import { playPop } from '../utils/audio';

interface TaskFilterBarProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: TaskSortBy;
  onSortByChange: (sort: TaskSortBy) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  counts: { total: number; active: number; completed: number };
  onClearCompleted: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  counts,
  onClearCompleted,
  searchInputRef,
}) => {
  return (
    <div id="task-filter-bar" className="space-y-3 pt-2">
      {/* Top row: Filter tabs and Clear completed */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter Chips (Figma Segmented Pill) */}
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="inline-flex p-1 bg-stone-200/60 rounded-xl border border-stone-300/60 gap-1 text-xs font-medium shadow-2xs"
        >
          <button
            id="filter-tab-all"
            role="tab"
            aria-selected={currentFilter === 'all'}
            onClick={() => {
              playPop();
              onFilterChange('all');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentFilter === 'all'
                ? 'bg-white text-stone-950 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All <span className="text-stone-400 ml-1 font-mono text-[11px]">{counts.total}</span>
          </button>
          <button
            id="filter-tab-active"
            role="tab"
            aria-selected={currentFilter === 'active'}
            onClick={() => {
              playPop();
              onFilterChange('active');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentFilter === 'active'
                ? 'bg-white text-stone-950 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Active <span className="text-stone-400 ml-1 font-mono text-[11px]">{counts.active}</span>
          </button>
          <button
            id="filter-tab-completed"
            role="tab"
            aria-selected={currentFilter === 'completed'}
            onClick={() => {
              playPop();
              onFilterChange('completed');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentFilter === 'completed'
                ? 'bg-white text-stone-950 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Completed <span className="text-stone-400 ml-1 font-mono text-[11px]">{counts.completed}</span>
          </button>
        </div>

        {/* Clear Completed button */}
        {counts.completed > 0 && (
          <button
            id="clear-completed-button"
            type="button"
            onClick={() => {
              playPop();
              onClearCompleted();
            }}
            aria-label="Clear all completed tasks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed ({counts.completed})</span>
          </button>
        )}
      </div>

      {/* Second row: Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input with Figma keyboard shortcut hint */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            id="search-tasks-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks or notes... (Press '/')"
            aria-label="Search tasks"
            className="w-full pl-9 pr-12 py-1.5 rounded-xl border border-stone-200 text-xs bg-white text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                playPop();
                onSearchChange('');
              }}
              aria-label="Clear search input"
              className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline absolute right-2.5 top-2 text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <span className="text-stone-400 text-[11px]">Sort:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => {
                playPop();
                onSortByChange(e.target.value as TaskSortBy);
              }}
              aria-label="Sort tasks by"
              className="bg-transparent border-none text-xs font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="default">Status & Newest</option>
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Creation Date</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {sortBy !== 'default' && (
            <button
              id="toggle-sort-order-button"
              type="button"
              onClick={() => {
                playPop();
                onToggleSortOrder();
              }}
              aria-label={`Toggle sort order (currently ${sortOrder === 'asc' ? 'ascending' : 'descending'})`}
              title={`Switch to ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              className="p-1.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
