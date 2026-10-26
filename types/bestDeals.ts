/**
 * @file types/bestDeals.ts
 * @description Type definitions for the Best Deals / Category Showcase system with Admin control.
 */

export interface BestDealBanner {
  image: string;
  tagEn: string;
  headingEn: string;
  subheadingEn?: string;
  link: string;
  bgColor?: string;
}

export interface BestDealSection {
  id: string;
  titleEn: string;
  categorySlug: string;
  keywords?: string[]; // fallback search keywords
  seeMoreLink: string;
  banner: BestDealBanner;
  productIds?: string[]; // explicit product IDs, or auto-derived if empty
  maxProducts?: number; // default 6
  enabled: boolean;
  order: number;
  stylePreset?: 'standard' | 'minimal' | 'highlighted' | 'patterned'; // Added stylePreset
}
