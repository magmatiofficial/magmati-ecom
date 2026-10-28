/**
 * @file components/ui/BrandLogo.tsx
 * @description Official MAGMATI Brand Logo Component utilizing the exact color palette
 * extracted from Adobe Color (#D12929 Primary Red, #F2CB57 Gold, #F2AA52 Warm Amber, #FFFFFF White).
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'banner';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  showSubtitle?: boolean;
}

export function MagmatiIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <img
      src="/magmati-logo.png"
      alt="Brand Logo"
      className={className}
    />
  );
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  className = '',
  showSubtitle = true,
}: BrandLogoProps) {
  const sizeClasses = {
    xs: {
      icon: 'w-6 h-6',
      text: 'text-base',
      badge: 'text-2xs px-1 py-0.2',
      sub: 'text-2xs',
    },
    sm: {
      icon: 'w-6.5 h-6.5',
      text: 'text-lg',
      badge: 'text-2xs px-1.5 py-0.2',
      sub: 'text-2xs',
    },
    md: {
      icon: 'w-9 h-9',
      text: 'text-2xl',
      badge: 'text-2xs px-2 py-0.5',
      sub: 'text-2xs',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
      badge: 'text-xs px-2.5 py-0.5',
      sub: 'text-xs',
    },
  }[size];

  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return <MagmatiIcon className={`${sizeClasses.icon} ${className}`} />;
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <MagmatiIcon className={`${sizeClasses.icon} shrink-0 transition-transform group-hover:scale-105 duration-200`} />

      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span
            className={`font-black tracking-tight ${sizeClasses.text} ${
              isDark ? 'text-white' : 'text-text-main'
            } group-hover:text-primary transition-colors`}
          >
            MAGMATI
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`font-bold uppercase tracking-[0.2em] mt-1 ${sizeClasses.sub} ${
              isDark ? 'text-zinc-400' : 'text-primary/90'
            }`}
          >
            MEGA MARKETPLACE
          </span>
        )}
      </div>
    </Link>
  );
}
