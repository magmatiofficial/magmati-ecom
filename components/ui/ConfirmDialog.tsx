/**
 * @file components/ui/ConfirmDialog.tsx
 * @description A highly accessible, mobile-friendly, reusable confirm dialog (modal) that replaces standard window.confirm().
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, loading]);

  // Focus lock & restore focus
  useEffect(() => {
    if (open) {
      // Store current active element to restore later
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      // Small delay to let rendering complete before locking focus
      const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const container = containerRef.current;
      if (container) {
        const focusableElements = container.querySelectorAll<HTMLElement>(focusableElementsString);
        // Find first primary action or confirm button to focus, or cancel button
        const confirmBtn = container.querySelector<HTMLElement>('[data-confirm-btn]');
        const cancelBtn = container.querySelector<HTMLElement>('[data-cancel-btn]');
        
        if (confirmBtn) {
          confirmBtn.focus();
        } else if (cancelBtn) {
          cancelBtn.focus();
        } else if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }

      // Add keydown listener inside modal for focus trapping
      const handleFocusTrap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab -> loop to last
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab -> loop to first
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleFocusTrap);
      
      // Lock scroll on body
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleFocusTrap);
        document.body.style.overflow = originalOverflow;
        // Restore focus
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [open]);

  if (!open) return null;

  // Backdrop click close handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return; // Prevent closing while action is in progress
    if (e.target === overlayRef.current) {
      onCancel();
    }
  };

  const isDanger = variant === 'danger';

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={containerRef}
        className={cn(
          "bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200",
          "animate-in fade-in zoom-in-95 duration-150",
          "max-h-[90dvh] overflow-y-auto flex flex-col justify-between select-none text-zinc-900 font-sans"
        )}
      >
        {/* Header/Content Area */}
        <div className="flex items-start gap-4 pb-4">
          <div
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]",
              isDanger ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
            )}
          >
            {isDanger ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <h3
              id="confirm-dialog-title"
              className="font-bold text-base sm:text-lg text-zinc-900 leading-tight"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed"
            >
              {message}
            </p>
          </div>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0 disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons with Safe touch target layout */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-h-[44px] h-11 text-xs font-bold cursor-pointer text-zinc-700 hover:bg-zinc-100"
            data-cancel-btn
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            className={cn(
              "min-h-[44px] h-11 text-xs font-black cursor-pointer",
              isDanger 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
            data-confirm-btn
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
