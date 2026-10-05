/**
 * @file lib/theme.ts
 * @description Centralized token names mapped to CSS variables.
 * All token values live exclusively in app/globals.css (:root + @theme).
 * This file contains NO raw color or size values.
 */

export const THEME_CONFIG = {
  // ============================================================================
  // 1. GLOBAL COLOR PALETTE & INTERACTIVE STATES (TOKEN NAMES)
  // ============================================================================
  colors: {
    // Primary Brand Colors & Hover States
    primary: 'var(--color-primary)',
    primaryHover: 'var(--color-primary-hover)',
    primaryLight: 'var(--color-primary-light)',
    primarySubtle: 'var(--color-primary-subtle)',
    primarySubtleHover: 'var(--color-primary-subtle-hover)',
    primaryDark: 'var(--color-primary-dark)',
    
    // Secondary / Dark Neutrals & Hover
    secondary: 'var(--color-secondary)',
    secondaryHover: 'var(--color-secondary-hover)',
    secondaryDark: 'var(--color-secondary-dark)',

    // Core Layout & Canvas Backgrounds
    appBg: 'var(--color-app-bg)',
    appBgAlt: 'var(--color-app-bg-alt)',
    appText: 'var(--color-app-text)',
    appTextMuted: 'var(--color-app-text-muted)',
    appTextSubtle: 'var(--color-app-text-subtle)',
    appTextHeading: 'var(--color-app-text-heading)',
    appTextPlaceholder: 'var(--color-app-text-placeholder)',
    appTextInverse: 'var(--color-app-inverse)',
    
    // Surface Containers, Cards & Hover States
    surface: 'var(--color-surface)',
    surfaceSubtle: 'var(--color-surface-subtle)',
    surfaceHover: 'var(--color-surface-hover)',
    surfaceActive: 'var(--color-surface-active)',
    surfaceDark: 'var(--color-surface-dark)',
    surfaceDarkHover: 'var(--color-surface-dark-hover)',
    surfaceHeader: 'var(--color-surface-header)',

    // Borders, Dividers & Focus States
    border: 'var(--color-border)',
    borderSubtle: 'var(--color-border-subtle)',
    borderDark: 'var(--color-border-dark)',
    borderHover: 'var(--color-border-hover)',
    borderFocus: 'var(--color-border-focus)',
    
    // Brand Accent Supporting Colors
    accent: 'var(--color-accent)',
    accentHover: 'var(--color-accent-hover)',
    accentSubtle: 'var(--color-accent-subtle)',
    gold: 'var(--color-accent)',
    amber: 'var(--color-brand-amber)',
    coral: 'var(--color-brand-coral)',
    dark: 'var(--color-surface-dark)',
    
    // Status & Feedback Colors
    success: 'var(--color-success)',
    successHover: 'var(--color-success-hover)',
    successSubtle: 'var(--color-success-subtle)',
    warning: 'var(--color-warning)',
    warningHover: 'var(--color-warning-hover)',
    warningSubtle: 'var(--color-warning-subtle)',
    error: 'var(--color-error)',
    errorHover: 'var(--color-error-hover)',
    errorSubtle: 'var(--color-error-subtle)',
    danger: 'var(--color-danger)',
    dangerHover: 'var(--color-danger-hover)',
    dangerSubtle: 'var(--color-danger-subtle)',
    info: 'var(--color-info)',
    infoHover: 'var(--color-info-hover)',
    infoSubtle: 'var(--color-info-subtle)',

    // Centralized Neutrals & Grayscale
    neutrals: {
      50: 'var(--palette-neutral-50)',
      100: 'var(--palette-neutral-100)',
      200: 'var(--palette-neutral-200)',
      300: 'var(--palette-neutral-300)',
      400: 'var(--palette-neutral-400)',
      500: 'var(--palette-neutral-500)',
      600: 'var(--palette-neutral-600)',
      700: 'var(--palette-neutral-700)',
      800: 'var(--palette-neutral-800)',
      900: 'var(--palette-neutral-900)',
      950: 'var(--palette-neutral-950)',
    },
  },

  // ============================================================================
  // 2. GLOBAL TYPOGRAPHY & FONT CONFIGURATION (TOKEN NAMES)
  // ============================================================================
  typography: {
    fontFamilies: {
      sans: 'var(--font-sans)',
      heading: 'var(--font-heading)',
      serif: 'var(--font-serif)',
      clean: 'var(--font-sans)',
      geometric: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    // ⭐ TEXT SIZE SCALE (11 BALANCED SIZES)
    sizes: {
      '3xs': 'var(--text-3xs)',
      '2xs': 'var(--text-2xs)',
      xs: 'var(--text-xs)',
      sm: 'var(--text-sm)',
      'base-sm': 'var(--text-base-sm)',
      base: 'var(--text-base)',
      md: 'var(--text-base)',
      lg: 'var(--text-lg)',
      xl: 'var(--text-xl)',
      '2xl': 'var(--text-2xl)',
      '3xl': 'var(--text-3xl)',
      '4xl': 'var(--text-4xl)',
      '5xl': 'var(--text-4xl)',
      display: 'var(--text-4xl)',
    },

    // Font Weights
    weights: {
      regular: 'var(--fw-regular)',
      normal: 'var(--fw-regular)',
      medium: 'var(--fw-medium)',
      semibold: 'var(--fw-semibold)',
      bold: 'var(--fw-bold)',
    },

    // Line Heights
    lineHeights: {
      tight: 'var(--lh-tight)',
      snug: 'var(--lh-snug)',
      normal: 'var(--lh-normal)',
      relaxed: 'var(--lh-relaxed)',
    },

    // Letter Spacing / Tracking
    letterSpacings: {
      tight: 'var(--ls-tight)',
      normal: 'var(--ls-normal)',
      wide: 'var(--ls-wide)',
      wider: 'var(--ls-wider)',
    },
  },

  // Legacy aliases
  fonts: {
    sans: 'var(--font-sans)',
    english: 'var(--font-english)',
    heading: 'var(--font-heading)',
  },

  // ============================================================================
  // 3. BORDERS & RADIUS TOKENS (TOKEN NAMES)
  // ============================================================================
  radius: {
    none: 'var(--radius-none)',
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    '3xl': 'var(--radius-3xl)',
    full: 'var(--radius-full)',
    card: 'var(--radius-card)',
    button: 'var(--radius-button)',
    input: 'var(--radius-input)',
    badge: 'var(--radius-badge)',
    image: 'var(--radius-image)',
  },

  // ============================================================================
  // 4. SHADOWS & ELEVATION TOKENS (TOKEN NAMES)
  // ============================================================================
  shadows: {
    '2xs': 'var(--shadow-2xs)',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    card: 'var(--shadow-card)',
    cardHover: 'var(--shadow-card-hover)',
    button: 'var(--shadow-button)',
    buttonHover: 'var(--shadow-button-hover)',
    elevated: 'var(--shadow-elevated)',
    dropdown: 'var(--shadow-dropdown)',
    modal: 'var(--shadow-modal)',
  },

  // ============================================================================
  // 5. CUSTOM RESPONSIVE BREAKPOINTS (TOKEN NAMES)
  // ============================================================================
  breakpoints: {
    xs: 'var(--breakpoint-xs)',
    sm: 'var(--breakpoint-sm)',
    md: 'var(--breakpoint-md)',
    lg: 'var(--breakpoint-lg)',
    xl: 'var(--breakpoint-xl)',
    '2xl': 'var(--breakpoint-2xl)',
  },

  // ============================================================================
  // 6. HOVER, TRANSITIONS & MOTION TOKENS (TOKEN NAMES)
  // ============================================================================
  transitions: {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
    ease: 'var(--ease-custom)',
  },

  hover: {
    scale: '1.02',
    scaleSubtle: '1.01',
    opacity: '0.85',
    brightness: '1.05',
  },

  // ============================================================================
  // 7. Z-INDEX LAYERING ARCHITECTURE (TOKEN NAMES)
  // ============================================================================
  zIndex: {
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    drawer: 'var(--z-drawer)',
    modal: 'var(--z-modal)',
    toast: 'var(--z-toast)',
    tooltip: 'var(--z-tooltip)',
  },
} as const;

export type ThemeColors = typeof THEME_CONFIG.colors;
export type ThemeTypography = typeof THEME_CONFIG.typography;
export type ThemeRadius = typeof THEME_CONFIG.radius;
export type ThemeShadows = typeof THEME_CONFIG.shadows;
export type ThemeBreakpoints = typeof THEME_CONFIG.breakpoints;
