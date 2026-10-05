/**
 * @file app/fonts.ts
 * @description Centralized font configuration for MAGMATI.
 * Integrates 'Inter' for modern clean English typography.
 */

import { Inter, Noto_Sans_Bengali } from 'next/font/google';

export const interFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const notoBengaliFallback = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-bengali',
});

// Backward compatibility alias exports
export const englishFont = interFont;
export const inter = interFont;
