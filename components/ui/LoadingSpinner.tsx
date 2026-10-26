'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'dark' | 'zinc';
  text?: string;
  subtext?: string;
  className?: string;
  fullHeight?: boolean;
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5 border-2',
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[2.5px]',
  lg: 'w-11 h-11 border-3',
  xl: 'w-14 h-14 border-4',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14',
};

const colorClasses = {
  primary: 'text-primary border-zinc-200 border-t-primary',
  white: 'text-white border-white/20 border-t-white',
  dark: 'text-zinc-900 border-zinc-200 border-t-zinc-900',
  zinc: 'text-zinc-500 border-zinc-200 border-t-zinc-500',
};

/**
 * Premium, sleek Loading Spinner component.
 * Replaces old skeleton loaders with a modern, fast, branded loading indicator.
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  subtext,
  className = '',
  fullHeight = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 transition-opacity duration-200 ${
        fullHeight ? 'min-h-[50dvh] py-12' : 'py-6'
      } ${className}`}
      role="status"
      aria-label={text || 'Loading'}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle Ambient Pulse Ring */}
        <div
          className={`absolute rounded-full animate-ping opacity-20 ${
            color === 'primary' ? 'bg-primary' : color === 'white' ? 'bg-white' : 'bg-zinc-800'
          } ${iconSizes[size]}`}
        />
        
        {/* High-Performance Rotating Ring */}
        <div
          className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        />
      </div>

      {text && (
        <span className="text-xs font-bold text-zinc-800 tracking-tight text-center">
          {text}
        </span>
      )}
      {subtext && (
        <span className="text-2xs text-zinc-500 text-center max-w-xs">
          {subtext}
        </span>
      )}
    </div>
  );
}

/**
 * Full page loading overlay with top-tier aesthetic.
 */
export function PageLoader({ text = 'লোড হচ্ছে...', subtext }: { text?: string; subtext?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xl flex flex-col items-center justify-center gap-3 max-w-sm w-full mx-auto">
        <LoadingSpinner size="lg" color="primary" text={text} subtext={subtext} />
      </div>
    </div>
  );
}

/**
 * Section-level loading card for product grids, deals, and lists.
 */
export function SectionLoader({
  height = 'min-h-[260px]',
  text = 'লোড হচ্ছে...',
  subtext,
}: {
  height?: string;
  text?: string;
  subtext?: string;
}) {
  return (
    <div
      className={`w-full bg-white/70 rounded-3xl border border-zinc-200/80 p-8 flex flex-col items-center justify-center shadow-xs ${height}`}
    >
      <LoadingSpinner size="md" color="primary" text={text} subtext={subtext} />
    </div>
  );
}

/**
 * Compact inline spinner for buttons, pills, search bars, and action chips.
 */
export function InlineSpinner({
  size = 'sm',
  color = 'primary',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md';
  color?: 'primary' | 'white' | 'dark' | 'zinc';
  className?: string;
}) {
  return (
    <Loader2
      className={`animate-spin ${iconSizes[size]} ${
        color === 'primary' ? 'text-primary' : color === 'white' ? 'text-white' : 'text-zinc-700'
      } ${className}`}
    />
  );
}
