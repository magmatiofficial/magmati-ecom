/**
 * @file components/ui/Input.tsx
 * @description Styled form input component with label, helperText, error states, and icon slots.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      helperText,
      label,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide"
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
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full min-h-[var(--spacing-touch-target)] px-4 py-2.5 bg-surface border rounded-[var(--radius-input)] text-[var(--text-input)] md:text-sm text-text-main placeholder:text-text-placeholder transition-all duration-150',
              'focus:outline-hidden focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]',
              'disabled:opacity-50 disabled:bg-surface-subtle disabled:cursor-not-allowed',
              error
                ? 'border-[var(--color-error)] text-text-main focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
                : 'border-border',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-text-muted">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
