/**
 * @file components/layout/DynamicThemeStyles.tsx
 * @description Injects global CSS variable overrides for dynamic border radius and accent colors at runtime
 * allowing the admin theme editor to customize styling without hardcoded tokens.
 */

'use client';

import { useEffect } from 'react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export function DynamicThemeStyles() {
  const settings = useSiteSettingsStore();
  const radiusPx = settings.borderRadiusPx ?? 12;
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
  let btnRadius = `${Math.max(0, radiusPx - 2)}px`;
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
      root.style.setProperty('--radius-xs', `${Math.max(2, Math.round(radiusPx * 0.25))}px`);
      root.style.setProperty('--radius-sm', `${Math.max(4, Math.round(radiusPx * 0.375))}px`);
      root.style.setProperty('--radius-md', `${Math.max(6, Math.round(radiusPx * 0.625))}px`);
      root.style.setProperty('--radius-lg', `${Math.max(8, Math.round(radiusPx * 0.875))}px`);
      root.style.setProperty('--radius-xl', `${Math.max(10, Math.round(radiusPx * 1.125))}px`);
      root.style.setProperty('--radius-2xl', `${Math.max(14, Math.round(radiusPx * 1.5))}px`);
      root.style.setProperty('--radius-3xl', `${Math.max(20, Math.round(radiusPx * 2.0))}px`);
      root.style.setProperty('--radius-full', '9999px');
      root.style.setProperty('--radius-card', `${radiusPx}px`);
      root.style.setProperty('--radius-button', btnRadius);
      root.style.setProperty('--radius-image', `${Math.max(0, radiusPx - 4)}px`);
      root.style.setProperty('--radius-input', `${Math.max(0, radiusPx - 2)}px`);
      root.style.setProperty('--radius-badge', `${Math.max(0, radiusPx - 6)}px`);
      
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
      --radius-card: ${radiusPx}px;
      --radius-button: ${btnRadius};
      --radius-image: ${Math.max(0, radiusPx - 4)}px;
      --radius-badge: ${Math.max(0, radiusPx - 6)}px;
      --radius-input: ${Math.max(0, radiusPx - 2)}px;

      --app-font-family: ${fontFamily};
      --app-font-heading: ${fontHeading};
      --app-base-font-size: ${baseFontSizePx}px;
      --app-font-scale: ${fontScale};
    }
  `;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: cssRules,
      }}
    />
  );
}
