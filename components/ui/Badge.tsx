/**
 * @file components/ui/Badge.tsx
 * @description Reusable status and promotional badge component using CVA and tokens.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-[var(--radius-badge)] transition-colors select-none',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-subtle text-text-main border border-border',
        primary: 'bg-primary text-white shadow-2xs',
        success: 'bg-success-subtle text-emerald-800 border border-emerald-200',
        warning: 'bg-warning-subtle text-amber-800 border border-amber-200',
        error: 'bg-error-subtle text-red-800 border border-red-200',
        info: 'bg-info-subtle text-blue-800 border border-blue-200',
        dark: 'bg-secondary text-white',
        gold: 'bg-accent/20 text-secondary border border-accent/40 font-bold',
        outline: 'border border-border text-text-muted bg-surface',
      },
      size: {
        sm: 'text-2xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
