/**
 * @file components/ui/Card.tsx
 * @description Card surface container component using CVA, tokens, and padding variants.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const cardVariants = cva(
  'bg-surface border border-border rounded-[var(--radius-card)] shadow-card overflow-hidden transition-all duration-200',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-[var(--spacing-sm)]',
        md: 'p-[var(--spacing-card-padding)]',
        lg: 'p-[var(--spacing-xl)]',
      },
      hoverable: {
        true: 'hover:shadow-card-hover hover:border-border-hover cursor-pointer transition-all duration-300',
        false: '',
      },
    },
    defaultVariants: {
      padding: 'none',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean;
  hoverEffect?: boolean; // Backward compatibility
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'none', hoverable, hoverEffect, children, ...props }, ref) => {
    const isHoverable = hoverable ?? hoverEffect ?? false;

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ padding, hoverable: isHoverable }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
