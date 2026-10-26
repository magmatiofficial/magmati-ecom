'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InlineAlertType = 'success' | 'error' | 'warning' | 'info';

const STYLES: Record<InlineAlertType, { box: string; icon: React.ElementType }> = {
  success: { box: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: CheckCircle2 },
  error: { box: 'bg-rose-50 text-rose-900 border-rose-200', icon: AlertCircle },
  warning: { box: 'bg-amber-50 text-amber-900 border-amber-200', icon: AlertTriangle },
  info: { box: 'bg-indigo-50 text-indigo-900 border-indigo-200', icon: Info },
};

interface InlineAlertProps {
  type: InlineAlertType;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function InlineAlert({ type, children, onClose, className }: InlineAlertProps) {
  const { box, icon: Icon } = STYLES[type];
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold leading-normal animate-in fade-in',
        box,
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 cursor-pointer p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
