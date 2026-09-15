import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  isProcessing = false,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button on open for safety
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
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

  if (!isOpen) return null;

  return (
    <div
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        id="delete-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="delete-modal-title"
              className="text-sm font-semibold text-stone-900"
            >
              {title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-stone-100">
          <button
            ref={cancelBtnRef}
            type="button"
            id="cancel-delete-button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 active:bg-red-800 transition-colors shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isProcessing ? 'Deleting...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
