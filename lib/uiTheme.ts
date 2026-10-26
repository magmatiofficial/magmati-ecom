/**
 * @file lib/uiTheme.ts
 * @description Dynamic UI styling presets and border radius mappings for admin panel customization.
 */

export type BorderRadiusPreset = 'sharp' | 'subtle' | 'balanced' | 'rounded' | 'soft';

export interface RadiusClasses {
  card: string;
  button: string;
  badge: string;
  input: string;
  image: string;
  px: string;
  labelEn: string;
  
}

export const RADIUS_MAP: Record<BorderRadiusPreset, RadiusClasses> = {
  sharp: {
    card: 'rounded-none',
    button: 'rounded-none',
    badge: 'rounded-none',
    input: 'rounded-none',
    image: 'rounded-none',
    px: '0px (Sharp)',
    labelEn: 'Sharp (0px)',
    
  },
  subtle: {
    card: 'rounded-md',
    button: 'rounded-md',
    badge: 'rounded-xs',
    input: 'rounded-md',
    image: 'rounded-sm',
    px: '6px (Subtle)',
    labelEn: 'Subtle (6px)',
    
  },
  balanced: {
    card: 'rounded-xl',
    button: 'rounded-lg',
    badge: 'rounded-md',
    input: 'rounded-lg',
    image: 'rounded-md',
    px: '10px (Balanced)',
    labelEn: 'Balanced (10px)',
    
  },
  rounded: {
    card: 'rounded-2xl',
    button: 'rounded-xl',
    badge: 'rounded-lg',
    input: 'rounded-xl',
    image: 'rounded-xl',
    px: '16px (Rounded)',
    labelEn: 'Rounded (16px)',
    
  },
  soft: {
    card: 'rounded-3xl',
    button: 'rounded-2xl',
    badge: 'rounded-xl',
    input: 'rounded-2xl',
    image: 'rounded-2xl',
    px: '24px (Pill)',
    labelEn: 'Soft / Pill (24px)',
    
  },
};

export const COLOR_PRESETS = [
];

