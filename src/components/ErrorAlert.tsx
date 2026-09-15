import React from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  const isPermission = message.toLowerCase().includes('permission');

  return (
    <div
      id="app-error-alert"
      role="alert"
      aria-live="assertive"
      className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 text-red-900 shadow-xs animate-in fade-in duration-150"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-1 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
          {isPermission ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">
            {isPermission ? 'Access Control Notification' : 'Action Failed'}
          </p>
          <p className="text-xs text-red-800 mt-0.5 leading-relaxed break-words">
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        id="dismiss-error-alert-button"
        onClick={onDismiss}
        aria-label="Dismiss error notification"
        className="text-red-500 hover:text-red-800 p-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
