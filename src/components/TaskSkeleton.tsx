import React from 'react';

export const TaskSkeleton: React.FC = () => {
  return (
    <div id="task-skeleton-list" className="space-y-3 animate-pulse" aria-label="Loading tasks">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-stone-200 bg-white flex items-start gap-3"
        >
          <div className="w-5 h-5 rounded-lg bg-stone-200 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded-md w-3/4" />
            <div className="h-3 bg-stone-100 rounded-md w-1/2" />
          </div>
          <div className="w-12 h-6 bg-stone-100 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
};
