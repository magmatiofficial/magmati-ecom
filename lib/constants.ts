/**
 * @file lib/constants.ts
 * @description Central store of application constants, business rules, and contact information.
 */

export const BRAND_NAME = 'MAGMATI';
export const BRAND_TAGLINE_EN = 'Premium Bangladeshi Fashion & Trends';
export const BRAND_TAGLINE_BN = BRAND_TAGLINE_EN;

export const HOTLINE_NUMBER = '+880 9612-000000';
export const SUPPORT_EMAIL = 'support@magmati.com';
export const WHATSAPP_NUMBER = '+880 1700-000000';

export const FREE_SHIPPING_THRESHOLD_BDT = 2500;
export const INSIDE_DHAKA_DELIVERY_FEE_BDT = 60;
export const OUTSIDE_DHAKA_DELIVERY_FEE_BDT = 100;

// Aliases for convenience across modules
export const STANDARD_DELIVERY_DHAKA = INSIDE_DHAKA_DELIVERY_FEE_BDT;
export const STANDARD_DELIVERY_OUTSIDE = OUTSIDE_DHAKA_DELIVERY_FEE_BDT;

export const PROMO_CODES = {
  EID2026: { code: 'EID2026', discountBDT: 200, minOrderBDT: 2500 },
  WELCOME100: { code: 'WELCOME100', discountBDT: 100, minOrderBDT: 1000 },
  FREESHIP: { code: 'FREESHIP', isFreeShipping: true, minOrderBDT: 1500 },
} as const;

