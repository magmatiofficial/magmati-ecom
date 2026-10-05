/**
 * @file components/ui/Button.tsx
 * @description Standard reusable Button component with CVA variants, sizes, icons, and loading states.
 */

'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-[var(--radius-button)]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-xs',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-dark shadow-xs',
        dark: 'bg-zinc-950 text-white hover:bg-primary active:bg-primary-dark shadow-xs',
        outline: 'border border-border bg-transparent text-text-main hover:bg-surface-hover hover:text-text-main active:bg-surface-subtle',
        ghost: 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text-main active:bg-surface-subtle',
        danger: 'bg-error text-white hover:bg-error-hover active:bg-error-dark shadow-xs',
        success: 'bg-success text-white hover:bg-success-hover active:bg-success-dark shadow-xs',
        gold: 'bg-accent text-secondary hover:bg-accent-hover font-bold shadow-xs',
      },
      size: {
        sm: 'min-h-[var(--spacing-touch-target-sm)] text-sm px-3 py-1.5 gap-1.5',
        md: 'min-h-[var(--spacing-touch-target)] text-sm sm:text-base px-4 py-2 gap-2',
        lg: 'min-h-[52px] text-base px-6 py-3 gap-2.5',
        icon: 'h-[var(--spacing-touch-target)] w-[var(--spacing-touch-target)] min-h-[var(--spacing-touch-target)] min-w-[var(--spacing-touch-target)] p-2 gap-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  isLoading?: boolean; // Backward compatibility
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isBusy = Boolean(loading || isLoading);
    const isIconOnly = size === 'icon';

    const spinnerColor =
      variant === 'primary' || variant === 'secondary' || variant === 'dark' || variant === 'danger' || variant === 'success'
        ? 'white'
        : 'primary';

    return (
      <button
        ref={ref}
        disabled={disabled || isBusy}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {isBusy ? (
          <LoadingSpinner
            size="xs"
            color={spinnerColor}
            className="!py-0 !gap-0 inline-flex shrink-0"
          />
        ) : (
          leftIcon && (
            <span className="inline-flex shrink-0 items-center justify-center">
              {leftIcon}
            </span>
          )
        )}

        {(!isIconOnly || !isBusy) && children}

        {!isBusy && rightIcon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
