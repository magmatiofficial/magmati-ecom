/**
 * @file components/ui/BrandLogo.tsx
 * @description Official MAGMATI Brand Logo Component
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'banner';
  size?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  showSubtitle?: boolean;
  width?: number | string;
  height?: number | string;
}

export function MagmatiIcon({
  className = '',
  width,
  height,
}: {
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  const style = width || height ? { width, height } : undefined;
  return (
    <img
      src="/magmati-logo.png"
      alt="Magmati Logo"
      style={style}
      className={`object-contain rounded-md ${width || height ? '' : 'w-9 h-9 md:w-10 md:h-10'} ${className}`}
    />
  );
}

export function BrandLogo({
  variant = 'full',
  theme = 'auto',
  className = '',
  width,
  height,
}: BrandLogoProps) {
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return <MagmatiIcon width={width} height={height} className={className} />;
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <MagmatiIcon width={width} height={height} className="shrink-0" />
      <span
        className={`font-black tracking-tight text-xl md:text-2xl ${
          isDark ? 'text-white' : 'text-text-main'
        } group-hover:text-primary transition-colors`}
      >
        MAGMATI
      </span>
    </Link>
  );
}
