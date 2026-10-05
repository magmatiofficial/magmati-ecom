/**
 * @file store/useBestDealsStore.ts
 * @description Zustand store for Best Deals sections with persistent storage & Admin HQ controls.
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BestDealSection } from '@/types/bestDeals';

export const DEFAULT_BEST_DEAL_SECTIONS: BestDealSection[] = [
  {
    id: 'section-bags',
    titleEn: 'Bag Emporium',
    categorySlug: 'men-fashion',
    keywords: ['bag', 'backpack', 'leather', 'wallet', 'crossbody', 'travel'],
    seeMoreLink: '/shop?q=bag',
    enabled: true,
    order: 1,
    maxProducts: 8,
    stylePreset: 'standard',
    banner: {
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UPTO 38% OFF',
      headingEn: 'PACK YOUR DREAMS BACKPACK',
      subheadingEn: 'Premium Quality & Waterproof',
      link: '/shop?q=bag',
      bgColor: '#1e293b',
    },
  },
  {
    id: 'section-air-fryer',
    titleEn: 'Air Fryer Deals',
    categorySlug: 'home-appliances',
    keywords: ['fryer', 'kitchen', 'cooker', 'oven', 'blender'],
    seeMoreLink: '/shop?q=fryer',
    enabled: true,
    order: 2,
    maxProducts: 8,
    stylePreset: 'highlighted',
    banner: {
      image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UP TO 60% OFF',
      headingEn: 'AIR FRYER MEGASALE',
      subheadingEn: 'Healthy Oil-Free Crispy Cooking',
      link: '/shop?q=fryer',
      bgColor: '#7f1d1d',
    },
  },
  {
    id: 'section-budget-watches',
    titleEn: 'Budget Watches',
    categorySlug: 'electronics-gadgets',
    keywords: ['watch', 'analog', 'quartz', 'chronograph', 'strap'],
    seeMoreLink: '/shop?q=watch',
    enabled: true,
    order: 3,
    maxProducts: 6,
    stylePreset: 'minimal',
    banner: {
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      tagEn: '50% DISCOUNT',
      headingEn: 'TIMELESS STYLE',
      subheadingEn: 'Budget Friendly Price Starting From BDT 950',
      link: '/shop?q=watch',
      bgColor: '#1e1b4b',
    },
  },
  {
    id: 'section-grooming',
    titleEn: 'Premium Grooming Essentials',
    categorySlug: 'beauty-health',
    keywords: ['grooming', 'trimmer', 'shaver', 'perfume', 'beard', 'skincare'],
    seeMoreLink: '/shop?category=beauty-health',
    enabled: true,
    order: 4,
    maxProducts: 6,
    stylePreset: 'patterned',
    banner: {
      image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
      tagEn: 'SPECIAL OFFER',
      headingEn: 'GROOMING ESSENTIAL',
      subheadingEn: 'Look Sharp, Feel Confident Every Day',
      link: '/shop?category=beauty-health',
      bgColor: '#14532d',
    },
  },
  {
    id: 'section-footwear',
    titleEn: 'Fashion Footwear',
    categorySlug: 'footwear',
    keywords: ['shoe', 'sneaker', 'loafer', 'sandal', 'boot', 'leather shoe'],
    seeMoreLink: '/shop?category=footwear',
    enabled: true,
    order: 5,
    maxProducts: 6,
    stylePreset: 'standard',
    banner: {
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UPTO 25% OFF',
      headingEn: 'TRENDY FOOTWEAR',
      subheadingEn: 'Comfort Meets Modern Urban Elegance',
      link: '/shop?category=footwear',
      bgColor: '#831843',
    },
  },
  {
    id: 'section-premium-watches',
    titleEn: 'Premium Watches',
    categorySlug: 'electronics-gadgets',
    keywords: ['premium watch', 'luxury watch', 'automatic', 'metal watch', 'curren', 'naviforce'],
    seeMoreLink: '/shop?q=luxury',
    enabled: true,
    order: 6,
    maxProducts: 6,
    stylePreset: 'highlighted',
    banner: {
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      tagEn: '50% DISCOUNT',
      headingEn: 'PREMIUM WATCH',
      subheadingEn: 'Luxury in Every Second',
      link: '/shop?q=luxury',
      bgColor: '#0f172a',
    },
  },
  {
    id: 'section-gadgets',
    titleEn: 'Gadget Deals',
    categorySlug: 'electronics-gadgets',
    keywords: ['earbuds', 'headphone', 'speaker', 'power bank', 'charger', 'gadget'],
    seeMoreLink: '/shop?category=electronics-gadgets',
    enabled: true,
    order: 7,
    maxProducts: 6,
    stylePreset: 'minimal',
    banner: {
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      tagEn: '70% DISCOUNT',
      headingEn: 'BEST GADGET DEALS',
      subheadingEn: 'Experience the Next Level Technology',
      link: '/shop?category=electronics-gadgets',
      bgColor: '#312e81',
    },
  },
  {
    id: 'section-helmets',
    titleEn: 'Helmet Deals',
    categorySlug: 'lifestyle-accessories',
    keywords: ['helmet', 'bike', 'motorcycle', 'safety', 'rider', 'gloves'],
    seeMoreLink: '/shop?q=helmet',
    enabled: true,
    order: 8,
    maxProducts: 6,
    stylePreset: 'patterned',
    banner: {
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UP TO 30% OFF',
      headingEn: 'BIKE HELMETS',
      subheadingEn: 'DOT Certified Safety on Every Ride',
      link: '/shop?q=helmet',
      bgColor: '#7c2d12',
    },
  },
  {
    id: 'section-smart-watches',
    titleEn: 'Smart Watch',
    categorySlug: 'electronics-gadgets',
    keywords: ['smartwatch', 'amoled', 'calling', 'fitness', 'bluetooth'],
    seeMoreLink: '/shop?q=smartwatch',
    enabled: true,
    order: 9,
    maxProducts: 6,
    stylePreset: 'standard',
    banner: {
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UPTO 38% DISCOUNT',
      headingEn: 'SMART ON WRIST',
      subheadingEn: 'Smarter in Life, Health & Productivity',
      link: '/shop?q=smartwatch',
      bgColor: '#111827',
    },
  },
  {
    id: 'section-kitchen',
    titleEn: 'Kitchen Appliances Deals',
    categorySlug: 'home-appliances',
    keywords: ['kettle', 'grinder', 'toaster', 'cooker', 'mixer', 'pan', 'appliance'],
    seeMoreLink: '/shop?category=home-appliances',
    enabled: true,
    order: 10,
    maxProducts: 6,
    stylePreset: 'highlighted',
    banner: {
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      tagEn: '55% DISCOUNT',
      headingEn: 'KITCHEN APPLIANCES',
      subheadingEn: 'Starting From BDT 1,350',
      link: '/shop?category=home-appliances',
      bgColor: '#701a75',
    },
  },
  {
    id: 'section-fans',
    titleEn: 'Rechargeable Fan Deals',
    categorySlug: 'home-appliances',
    keywords: ['fan', 'rechargeable', 'cooler', 'table fan', 'hand fan'],
    seeMoreLink: '/shop?q=fan',
    enabled: true,
    order: 11,
    maxProducts: 6,
    stylePreset: 'minimal',
    banner: {
      image: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UPTO 28% OFF',
      headingEn: 'RECHARGEABLE FAN',
      subheadingEn: 'Starting From 640 TK with Long Battery Backup',
      link: '/shop?q=fan',
      bgColor: '#0c4a6e',
    },
  },
  {
    id: 'section-ac',
    titleEn: 'AC Deals',
    categorySlug: 'home-appliances',
    keywords: ['ac', 'air conditioner', 'inverter', 'gree', 'midea', 'cooling'],
    seeMoreLink: '/shop?q=ac',
    enabled: true,
    order: 12,
    maxProducts: 6,
    stylePreset: 'patterned',
    banner: {
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      tagEn: 'UP TO 36% OFF',
      headingEn: 'AIR CONDITIONER',
      subheadingEn: 'Starting From 39,000 TK with 10yr Compressor Warranty',
      link: '/shop?q=ac',
      bgColor: '#064e3b',
    },
  },
];

interface BestDealsState {
  sections: BestDealSection[];
  addSection: (section: Omit<BestDealSection, 'id' | 'order'>) => void;
  updateSection: (id: string, updates: Partial<BestDealSection>) => void;
  deleteSection: (id: string) => void;
  toggleSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  reorderSections: (newSections: BestDealSection[]) => void;
  resetToDefault: () => void;
}

export const useBestDealsStore = create<BestDealsState>()(
  persist(
    (set, get) => ({
      sections: DEFAULT_BEST_DEAL_SECTIONS,

      addSection: (newSectionData) => {
        const id = `bd-${Date.now()}`;
        const currentSections = get().sections;
        const newSection: BestDealSection = {
          ...newSectionData,
          id,
          order: currentSections.length + 1,
          enabled: true,
        };
        set({ sections: [...currentSections, newSection] });
      },

      updateSection: (id, updates) => {
        set((state) => ({
          sections: state.sections.map((sec) =>
            sec.id === id ? { ...sec, ...updates } : sec
          ),
        }));
      },

      deleteSection: (id) => {
        set((state) => ({
          sections: state.sections.filter((sec) => sec.id !== id),
        }));
      },

      toggleSection: (id) => {
        set((state) => ({
          sections: state.sections.map((sec) =>
            sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
          ),
        }));
      },

      moveSection: (id, direction) => {
        const sections = [...get().sections];
        const idx = sections.findIndex((s) => s.id === id);
        if (idx === -1) return;

        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sections.length) return;

        const [moved] = sections.splice(idx, 1);
        sections.splice(targetIdx, 0, moved);

        // re-index order
        const reindexed = sections.map((sec, index) => ({
          ...sec,
          order: index + 1,
        }));
        set({ sections: reindexed });
      },

      reorderSections: (newSections) => {
        const reindexed = newSections.map((sec, index) => ({
          ...sec,
          order: index + 1,
        }));
        set({ sections: reindexed });
      },

      resetToDefault: () => {
        set({ sections: DEFAULT_BEST_DEAL_SECTIONS });
      },
    }),
    {
      name: 'magmati-best-deals-storage',
      version: 3,
      migrate: (persistedState: any) => {
        if (!persistedState || !persistedState.sections || persistedState.sections.length < 12) {
          return { sections: DEFAULT_BEST_DEAL_SECTIONS };
        }
        return persistedState;
      },
    }
  )
);
