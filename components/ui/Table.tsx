/**
 * @file components/ui/Table.tsx
 * @description Reusable table building blocks (TH, TD, TR) providing consistent styling, density, and alignment across admin tables.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface THProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  last?: boolean;
  nowrap?: boolean;
  mono?: boolean;
  density?: 'compact' | 'comfortable';
}

export const TH = React.forwardRef<HTMLTableCellElement, THProps>(
  (
    {
      align = 'left',
      last = false,
      nowrap = false,
      mono = false,
      density = 'compact',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-2.5 border-b border-primary-dark/30 bg-primary text-[var(--color-on-primary)]',
          density === 'comfortable' ? 'py-3' : 'py-2',
          !last && 'border-r',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          align === 'left' && 'text-left',
          nowrap && 'whitespace-nowrap',
          mono && 'font-mono',
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TH.displayName = 'TH';

export interface TDProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'image' | 'check' | 'actions';
  last?: boolean;
  nowrap?: boolean;
  mono?: boolean;
  density?: 'compact' | 'comfortable';
}

export const TD = React.forwardRef<HTMLTableCellElement, TDProps>(
  (
    {
      align,
      variant = 'default',
      last = false,
      nowrap = false,
      mono = false,
      density = 'compact',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const effectiveAlign = align ?? (variant !== 'default' ? 'center' : 'left');

    return (
      <td
        ref={ref}
        className={cn(
          'border-b border-zinc-200',
          variant === 'image' ? 'px-2' : 'px-2.5',
          variant === 'check' && 'w-9',
          density === 'comfortable' ? 'py-3.5' : 'py-1.5',
          !last && 'border-r',
          effectiveAlign === 'center' && 'text-center',
          effectiveAlign === 'right' && 'text-right',
          effectiveAlign === 'left' && 'text-left',
          (nowrap || variant === 'actions') && 'whitespace-nowrap',
          mono && 'font-mono',
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TD.displayName = 'TD';

export interface TRProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}

export const TR = React.forwardRef<HTMLTableRowElement, TRProps>(
  ({ selected = false, clickable = false, className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'hover:bg-amber-50/40 transition-colors group',
          selected && 'bg-amber-50/20',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TR.displayName = 'TR';
