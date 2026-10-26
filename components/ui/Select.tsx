/**
 * @file components/ui/Select.tsx
 * @description Styled form select component with label, helperText, error states, and icon slots matching Input.tsx.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      error,
      helperText,
      label,
      leftIcon,
      id,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full min-h-[var(--spacing-touch-target)] px-4 py-2.5 bg-surface border rounded-[var(--radius-input)] text-[var(--text-input)] text-text-main appearance-none transition-all duration-150',
              'focus:outline-hidden focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]',
              'disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed',
              error
                ? 'border-[var(--color-error)] text-text-main focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
                : 'border-border',
              leftIcon && 'pl-10',
              'pr-10',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-[var(--color-error)]">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
