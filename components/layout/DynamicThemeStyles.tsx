/**
 * @file components/layout/DynamicThemeStyles.tsx
 * @description Injects global CSS variable overrides for dynamic border radius and accent colors at runtime
 * allowing the admin theme editor to customize styling without hardcoded tokens.
 */

'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function DynamicThemeStyles() {
  const settings = useSiteSettings();
  const radiusPx = settings.borderRadiusPx ?? 12;
  const baseRadius = Math.max(0, radiusPx - 2);
  const radii = {
    xs: Math.max(2, Math.round(baseRadius * 0.25)),
    sm: Math.max(3, Math.round(baseRadius * 0.4)),
    md: Math.max(4, Math.round(baseRadius * 0.6)),
    lg: Math.max(6, Math.round(baseRadius * 0.8)),
    xl: Math.max(8, baseRadius),
    xl2: Math.max(10, Math.round(baseRadius * 1.2)),
    xl3: Math.max(12, Math.round(baseRadius * 1.4)),
    card: baseRadius,
    image: Math.max(0, baseRadius - 4),
    input: Math.max(0, baseRadius - 2),
    badge: Math.max(0, baseRadius - 6),
  };
  const customAccentColor = settings.accentColor?.trim() || '';
  const baseFontSizePx = settings.baseFontSizePx ?? 16;
  const fontScale = settings.fontSizeScale ?? (baseFontSizePx / 16);
  const fontPreset = settings.fontPreset ?? 'sans';

  // Calculate font family stack
  let fontFamily = 'var(--font-inter, "Inter"), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  let fontHeading = 'var(--font-inter, "Inter"), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  if (fontPreset === 'editorial') {
    fontFamily = 'Georgia, Cambria, "Times New Roman", Times, serif';
    fontHeading = 'Georgia, Cambria, "Times New Roman", Times, serif';
  } else if (fontPreset === 'clean') {
    fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fontHeading = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  } else if (fontPreset === 'geometric') {
    fontFamily = 'var(--font-inter, "Inter"), "Segoe UI", sans-serif';
    fontHeading = 'var(--font-inter, "Inter"), "Segoe UI", sans-serif';
  }

  // Calculate button radius based on shape preset
  let btnRadius = `${Math.max(0, baseRadius - 2)}px`;
  if (settings.buttonShapePreset === 'square') {
    btnRadius = '0px';
  } else if (settings.buttonShapePreset === 'pill') {
    btnRadius = '9999px';
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Dynamic Colors & Interactive States (Only override when customAccentColor exists)
      if (customAccentColor) {
        root.style.setProperty('--color-primary', customAccentColor);
        root.style.setProperty('--color-primary-hover', `color-mix(in srgb, ${customAccentColor} 85%, black)`);
        root.style.setProperty('--color-primary-light', `color-mix(in srgb, ${customAccentColor} 6%, white)`);
        root.style.setProperty('--color-primary-subtle', `color-mix(in srgb, ${customAccentColor} 12%, white)`);
        root.style.setProperty('--color-primary-subtle-hover', `color-mix(in srgb, ${customAccentColor} 22%, white)`);
        root.style.setProperty('--color-primary-dark', `color-mix(in srgb, ${customAccentColor} 70%, black)`);
        root.style.setProperty('--color-border-focus', customAccentColor);
        root.style.setProperty('--shadow-button', `0 4px 14px -3px ${customAccentColor}59`);
        root.style.setProperty('--shadow-button-hover', `0 6px 18px -2px ${customAccentColor}73`);
      } else {
        root.style.removeProperty('--color-primary');
        root.style.removeProperty('--color-primary-hover');
        root.style.removeProperty('--color-primary-light');
        root.style.removeProperty('--color-primary-subtle');
        root.style.removeProperty('--color-primary-subtle-hover');
        root.style.removeProperty('--color-primary-dark');
        root.style.removeProperty('--color-border-focus');
        root.style.removeProperty('--shadow-button');
        root.style.removeProperty('--shadow-button-hover');
      }
      
      // Dynamic Border Radii (Scaled dynamically from radiusPx)
      root.style.setProperty('--radius-none', '0px');
      root.style.setProperty('--radius-xs', `${radii.xs}px`);
      root.style.setProperty('--radius-sm', `${radii.sm}px`);
      root.style.setProperty('--radius-md', `${radii.md}px`);
      root.style.setProperty('--radius-lg', `${radii.lg}px`);
      root.style.setProperty('--radius-xl', `${radii.xl}px`);
      root.style.setProperty('--radius-2xl', `${radii.xl2}px`);
      root.style.setProperty('--radius-3xl', `${radii.xl3}px`);
      root.style.setProperty('--radius-full', '9999px');
      root.style.setProperty('--radius-card', `${radii.card}px`);
      root.style.setProperty('--radius-button', btnRadius);
      root.style.setProperty('--radius-image', `${radii.image}px`);
      root.style.setProperty('--radius-input', `${radii.input}px`);
      root.style.setProperty('--radius-badge', `${radii.badge}px`);
      
      // Dynamic Fonts
      root.style.setProperty('--app-font-family', fontFamily);
      root.style.setProperty('--app-font-heading', fontHeading);

      root.style.fontSize = `${fontScale * 100}%`;

      // Synchronize language attribute to English
      root.setAttribute('lang', 'en');
      root.classList.remove('lang-bn');
    }
  }, [customAccentColor, radiusPx, btnRadius, baseFontSizePx, fontScale, fontPreset, fontFamily, fontHeading]);

  const colorOverrides = customAccentColor ? `
    --color-primary: ${customAccentColor};
    --color-primary-hover: color-mix(in srgb, ${customAccentColor} 85%, black);
    --color-primary-light: color-mix(in srgb, ${customAccentColor} 6%, white);
    --color-primary-subtle: color-mix(in srgb, ${customAccentColor} 12%, white);
    --color-primary-subtle-hover: color-mix(in srgb, ${customAccentColor} 22%, white);
    --color-primary-dark: color-mix(in srgb, ${customAccentColor} 70%, black);
    --color-border-focus: ${customAccentColor};
    --shadow-button: 0 4px 14px -3px ${customAccentColor}59;
    --shadow-button-hover: 0 6px 18px -2px ${customAccentColor}73;
  ` : '';

  const cssRules = `
    :root {
      ${colorOverrides}
      --radius-none: 0px;
      --radius-xs: ${radii.xs}px;
      --radius-sm: ${radii.sm}px;
      --radius-md: ${radii.md}px;
      --radius-lg: ${radii.lg}px;
      --radius-xl: ${radii.xl}px;
      --radius-2xl: ${radii.xl2}px;
      --radius-3xl: ${radii.xl3}px;
      --radius-full: 9999px;
      --radius-card: ${radii.card}px;
      --radius-button: ${btnRadius};
      --radius-image: ${radii.image}px;
      --radius-badge: ${radii.badge}px;
      --radius-input: ${radii.input}px;

      --app-font-family: ${fontFamily};
      --app-font-heading: ${fontHeading};
      --app-base-font-size: ${baseFontSizePx}px;
      --app-font-scale: ${fontScale};
    }
    html { font-size: ${fontScale * 100}%; }
  `;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: cssRules,
      }}
    />
  );
}
