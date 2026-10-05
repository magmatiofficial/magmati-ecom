'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INSIDE_DHAKA_DELIVERY_FEE_BDT, OUTSIDE_DHAKA_DELIVERY_FEE_BDT } from '@/lib/constants';

export interface HeroSlideConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discount?: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface SmallBannerConfig {
  title: string;
  badge: string;
  image: string;
  link: string;
}

export interface HomeSectionConfig {
  id: string;
  name: string;
  enabled: boolean;
  preset: string;
  customTitle?: string;
  customSubtitle?: string;
  bgColor?: string;
}

export interface ComboConfig {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  comboPrice: number;
  originalPrice?: number;
  enabled: boolean;
  items: { productId: string; quantity: number }[];
}

export interface B1G1Config {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  buyProductId: string;
  buyQuantity: number;
  getProductId: string;
  getQuantity: number;
  enabled: boolean;
}

export interface SiteSettings {
  appName: string;
  tagline: string;
  announcementText: string;
  showAnnouncementBar: boolean;
  announcementBgColor: string;
  announcementTextColor: string;
  accentColor: string; // e.g. '#D12929', '#059669', '#2563EB', '#D97706', '#18181B'
  fontPreset: 'sans' | 'editorial' | 'clean' | 'geometric';
  borderRadiusPreset: 'sharp' | 'subtle' | 'balanced' | 'rounded' | 'soft'; // sharp: 0px, subtle: 6px, balanced: 10px, rounded: 16px, soft: 24px
  borderRadiusPx: number; // Exact numeric border radius in px (0 to 40)
  baseFontSizePx: number; // Base font size in px (13px to 20px)
  fontSizeScale: number; // Scale ratio relative to 16px (0.8125 to 1.25)
  fontSizePreset: 'compact' | 'standard' | 'comfortable' | 'large'; // compact: 14px (87.5%), standard: 16px (100%), comfortable: 18px (112.5%), large: 20px (125%)
  buttonShapePreset: 'square' | 'rounded' | 'pill';
  cardStylePreset: 'modern_bordered' | 'shadow_elevated' | 'minimal_flat' | 'heavy_shadow';
  heroPreset: 'magmati_live_campaign' | 'split_modern' | 'cinematic_fullwidth' | 'editorial_minimal' | 'compact_banner_grid';
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  insideDhakaDeliveryFee: number;
  outsideDhakaDeliveryFee: number;
  freeShippingThreshold: number;
  showFlashDeals: boolean;
  showNewArrivals: boolean;
  showAssuranceBanner: boolean;
  showCuratedZones: boolean;
  showBrandPavilion: boolean;
  flashSaleTitle: string;
  flashSaleSubtitle: string;
  flashSaleDurationHours: number;
  flashSaleEndTime: string;
  lowStockThreshold: number;
  showDiscountBadge?: boolean;
  showFlashBadge?: boolean;
  showTrendingBadge?: boolean;
  showMallBadge?: boolean;
  showHotDealBadge?: boolean;
  showNewBadge?: boolean;
  
  // Return System Admin Controls
  enableReturns: boolean;
  returnWindowDays: number;
  allowMindChangeReturns: boolean;
  requirePhotoUpload: boolean;
  maxPhotoUploads: number;
  insideDhakaReturnFee: number;
  outsideDhakaReturnFee: number;
  enableBkashRefund: boolean;
  enableNagadRefund: boolean;
  enableRocketRefund: boolean;
  enableBankRefund: boolean;
  returnPageTitle: string;
  returnPageSubtitle: string;
  showUnboxingNotice: boolean;
  unboxingNoticeText: string;
  returnPolicyNotes: string;

  heroSlides: HeroSlideConfig[];
  sectionLayouts: HomeSectionConfig[];
  smallBanner1?: SmallBannerConfig;
  smallBanner2?: SmallBannerConfig;
  combos: ComboConfig[];
  b1g1Offers: B1G1Config[];
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSettings: () => void;
  addHeroSlide: (slide: Omit<HeroSlideConfig, 'id'>) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlideConfig>) => void;
  deleteHeroSlide: (id: string) => void;
  reorderSections: (newSections: HomeSectionConfig[]) => void;
  moveSection: (index: number, direction: 'up' | 'down') => void;
  toggleSection: (id: string) => void;
  deleteSection: (id: string) => void;
  addSection: (section: HomeSectionConfig) => void;
  updateSection: (id: string, updates: Partial<HomeSectionConfig>) => void;
  updateSectionPreset: (id: string, preset: string) => void;
  updateSectionTitle: (id: string, name: string) => void;
  addCombo: (combo: Omit<ComboConfig, 'id'>) => void;
  updateCombo: (id: string, combo: Partial<ComboConfig>) => void;
  deleteCombo: (id: string) => void;
  toggleCombo: (id: string) => void;
  addB1G1Offer: (offer: Omit<B1G1Config, 'id'>) => void;
  updateB1G1Offer: (id: string, offer: Partial<B1G1Config>) => void;
  deleteB1G1Offer: (id: string) => void;
  toggleB1G1Offer: (id: string) => void;
}

const defaultHeroSlides: HeroSlideConfig[] = [
  {
    id: 'slide-1',
    badge: 'MEGA TECH SALE',
    discount: 'UP TO 60% OFF',
    title: 'Smart Tech & Gadgets',
    subtitle: 'Original smartwatches, earbuds & gear with warranty',
    buttonText: 'Shop Now',
    buttonLink: '/shop?category=Electronics+%26+Gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop&q=85',
  },
  {
    id: 'slide-2',
    badge: 'FESTIVE COLLECTION',
    discount: 'FLAT 40% OFF',
    title: 'Royal Festive Attires',
    subtitle: 'Designer Panjabis, Jamdanis & luxury festive wear',
    buttonText: 'Shop Fashion',
    buttonLink: '/shop?category=Men%27s+Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop&q=85',
  },
  {
    id: 'slide-3',
    badge: 'HOME UPGRADES',
    discount: 'FROM ৳999',
    title: 'Modern Kitchen & Living',
    subtitle: 'Digital air fryers, blenders & home appliances',
    buttonText: 'Grab Deals',
    buttonLink: '/shop?category=Home+%26+Kitchen+Appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&auto=format&fit=crop&q=85',
  }
];

const defaultSectionLayouts: HomeSectionConfig[] = [
  { id: 'hero', name: 'Hero Banner Slider', enabled: true, preset: 'hero_slider' },
  { id: 'categories', name: 'Shop by Category', enabled: true, preset: 'cards' },
  { id: 'combo_products', name: 'Combo Products & Bundles', enabled: true, preset: 'cards' },
  { id: 'buy1_get1', name: 'Buy 1 Get 1 Free Offers', enabled: true, preset: 'cards' },
  { id: 'flash_deals', name: 'Flash Deals Countdown', enabled: true, preset: 'timer_grid' },
  { id: 'daily_deals', name: 'Daily Deals Countdown', enabled: true, preset: 'timer_grid' },
  { id: 'budget_deals', name: 'Budget Deals Zone', enabled: true, preset: 'badge_grid' },
  { id: 'vouchers', name: 'Voucher & Coupon Hub', enabled: true, preset: 'ticket_grid' },
  { id: 'trending_picks', name: 'Trending & Recommended Picks', enabled: true, preset: 'tabbed_grid' },
  { id: 'new_arrivals', name: 'New Arrivals Catalog', enabled: true, preset: 'catalog_grid' },
  { id: 'brand_mall', name: 'Official Brand Mall', enabled: true, preset: 'pavilion_grid' },
  { id: 'reviews', name: 'Customer Reviews & Ratings', enabled: true, preset: 'testimonial_grid' },
  { id: 'app_download', name: 'Promo App & Welcome Banner', enabled: true, preset: 'bottom_strip' },
];

const defaultSettings = {
  appName: 'MAGMATI',
  tagline: 'The Ultimate Premium Marketplace',
  announcementText: '🔥 Eid & Autumn Mega Sale: Up to 50% OFF across all categories! Free shipping over ৳2,500.',
  showAnnouncementBar: true,
  announcementBgColor: '#141414',
  announcementTextColor: '#FFFFFF',
  accentColor: '',
  fontPreset: 'sans' as const,
  borderRadiusPreset: 'balanced' as const, // sharp (0px), subtle (6px), balanced (10px), rounded (16px), soft (24px)
  borderRadiusPx: 12,
  baseFontSizePx: 16,
  fontSizeScale: 1.0,
  fontSizePreset: 'standard' as const,
  buttonShapePreset: 'rounded' as const,
  cardStylePreset: 'modern_bordered' as const,
  heroPreset: 'magmati_live_campaign' as const,
  supportPhone: '+880 9612-345678',
  supportEmail: 'support@magmati.com',
  whatsappNumber: '+880 1700-000000',
  facebookUrl: 'https://facebook.com/magmatilifestyle',
  instagramUrl: 'https://instagram.com/magmati_official',
  youtubeUrl: 'https://youtube.com/@magmatilifestyle',
  tiktokUrl: 'https://tiktok.com/@magmatilifestyle',
  linkedinUrl: 'https://linkedin.com/company/magmatilifestyle',
  insideDhakaDeliveryFee: INSIDE_DHAKA_DELIVERY_FEE_BDT,
  outsideDhakaDeliveryFee: OUTSIDE_DHAKA_DELIVERY_FEE_BDT,
  freeShippingThreshold: 2500,
  showFlashDeals: true,
  showNewArrivals: true,
  showAssuranceBanner: true,
  showCuratedZones: true,
  showBrandPavilion: true,
  flashSaleTitle: 'FLASH SALE',
  flashSaleSubtitle: 'Up to 50% Off Limited Time Deals',
  flashSaleDurationHours: 24,
  flashSaleEndTime: '2026-10-01T23:59:59',
  lowStockThreshold: 5,
  showDiscountBadge: true,
  showFlashBadge: true,
  showTrendingBadge: true,
  showMallBadge: true,
  showHotDealBadge: true,
  showNewBadge: true,

  // Return System Admin Defaults
  enableReturns: true,
  returnWindowDays: 7,
  allowMindChangeReturns: true,
  requirePhotoUpload: true,
  maxPhotoUploads: 5,
  insideDhakaReturnFee: INSIDE_DHAKA_DELIVERY_FEE_BDT,
  outsideDhakaReturnFee: OUTSIDE_DHAKA_DELIVERY_FEE_BDT,
  enableBkashRefund: true,
  enableNagadRefund: true,
  enableRocketRefund: true,
  enableBankRefund: true,
  returnPageTitle: 'Request Product Return',
  returnPageSubtitle: 'Submit a return request within the allowed policy window for a fast refund or replacement.',
  showUnboxingNotice: true,
  unboxingNoticeText: '📢 Upon receiving, unbox immediately and take a clear photo of the product next to the printed invoice. This photo is strictly REQUIRED to submit a return application.',
  returnPolicyNotes: 'Items must be unused, in original packaging with tags intact. Refunds will be disbursed within 24-48 hours after courier pickup verification.',

  heroSlides: defaultHeroSlides,
  sectionLayouts: defaultSectionLayouts,
  combos: [
    {
      id: 'combo-demo-1',
      title: 'Smart Tech Power Bundle',
      subtitle: 'Ultra AMOLED Smartwatch + 20,000mAh Power Bank',
      badge: 'MEGA SAVINGS BUNDLE',
      comboPrice: 4800,
      originalPrice: 6400,
      enabled: true,
      items: [
        { productId: 'elec-ultra-watch-pro', quantity: 1 },
        { productId: 'elec-powerbank-20000', quantity: 1 },
      ],
    },
  ] as ComboConfig[],
  b1g1Offers: [
    {
      id: 'b1g1-demo-1',
      title: 'Buy Smartwatch, Get Waterproof Speaker FREE',
      subtitle: 'Receive a 360° Surround Sound Wireless Speaker completely free with this watch order!',
      badge: 'BUY 1 GET 1 FREE',
      buyProductId: 'elec-ultra-watch-pro',
      buyQuantity: 1,
      getProductId: 'elec-bluetooth-speaker',
      getQuantity: 1,
      enabled: true,
    },
  ] as B1G1Config[],
  smallBanner1: {
    title: 'Festive Attire',
    badge: '40% OFF',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Men%27s+Fashion',
  },
  smallBanner2: {
    title: 'Smart Gear',
    badge: '৳999+',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Electronics+%26+Gadgets',
  },
};

export const useSiteSettingsStore = create<SiteSettings>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      resetSettings: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('magmati-mart-site-settings');
            useSiteSettingsStore.persist?.clearStorage();
          } catch (e) {
            console.error('Error clearing site settings cache:', e);
          }
        }
        set(() => ({
          ...defaultSettings,
          heroSlides: JSON.parse(JSON.stringify(defaultHeroSlides)),
          sectionLayouts: JSON.parse(JSON.stringify(defaultSectionLayouts)),
        }));
      },
      addHeroSlide: (slideData) => {
        const newSlide: HeroSlideConfig = {
          ...slideData,
          id: `slide-${Date.now()}`,
        };
        set((state) => ({
          heroSlides: [...state.heroSlides, newSlide],
        }));
      },
      updateHeroSlide: (id, slideData) => {
        set((state) => ({
          heroSlides: state.heroSlides.map((s) => (s.id === id ? { ...s, ...slideData } : s)),
        }));
      },
      deleteHeroSlide: (id) => {
        set((state) => ({
          heroSlides: state.heroSlides.filter((s) => s.id !== id),
        }));
      },
      reorderSections: (newSections) => set({ sectionLayouts: newSections }),
      moveSection: (index, direction) => {
        set((state) => {
          const newLayouts = [...state.sectionLayouts];
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= newLayouts.length) return state;
          const temp = newLayouts[index];
          newLayouts[index] = newLayouts[targetIndex];
          newLayouts[targetIndex] = temp;
          return { sectionLayouts: newLayouts };
        });
      },
      toggleSection: (id) => {
        set((state) => ({
          sectionLayouts: state.sectionLayouts.map((sec) =>
            sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
          ),
        }));
      },
      deleteSection: (id) => {
        set((state) => ({
          sectionLayouts: state.sectionLayouts.filter((sec) => sec.id !== id),
        }));
      },
      addSection: (section) => {
        set((state) => ({
          sectionLayouts: [...state.sectionLayouts, section],
        }));
      },
      updateSection: (id, updates) => {
        set((state) => ({
          sectionLayouts: state.sectionLayouts.map((sec) =>
            sec.id === id ? { ...sec, ...updates } : sec
          ),
        }));
      },
      updateSectionPreset: (id, preset) => {
        set((state) => ({
          sectionLayouts: state.sectionLayouts.map((sec) =>
            sec.id === id ? { ...sec, preset } : sec
          ),
        }));
      },
      updateSectionTitle: (id, name) => {
        set((state) => ({
          sectionLayouts: state.sectionLayouts.map((sec) =>
            sec.id === id ? { ...sec, name } : sec
          ),
        }));
      },
      addCombo: (comboData) => {
        const newCombo: ComboConfig = {
          ...comboData,
          id: `combo-${Date.now()}`,
        };
        set((state) => ({
          combos: [...(state.combos || []), newCombo],
        }));
      },
      updateCombo: (id, comboData) => {
        set((state) => ({
          combos: (state.combos || []).map((c) => (c.id === id ? { ...c, ...comboData } : c)),
        }));
      },
      deleteCombo: (id) => {
        set((state) => ({
          combos: (state.combos || []).filter((c) => c.id !== id),
        }));
      },
      toggleCombo: (id) => {
        set((state) => ({
          combos: (state.combos || []).map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
        }));
      },
      addB1G1Offer: (offerData) => {
        const newOffer: B1G1Config = {
          ...offerData,
          id: `b1g1-${Date.now()}`,
        };
        set((state) => ({
          b1g1Offers: [...(state.b1g1Offers || []), newOffer],
        }));
      },
      updateB1G1Offer: (id, offerData) => {
        set((state) => ({
          b1g1Offers: (state.b1g1Offers || []).map((o) => (o.id === id ? { ...o, ...offerData } : o)),
        }));
      },
      deleteB1G1Offer: (id) => {
        set((state) => ({
          b1g1Offers: (state.b1g1Offers || []).filter((o) => o.id !== id),
        }));
      },
      toggleB1G1Offer: (id) => {
        set((state) => ({
          b1g1Offers: (state.b1g1Offers || []).map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)),
        }));
      },
    }),
    {
      name: 'magmati-mart-site-settings',
      version: 10,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState.sectionLayouts || version < 9) {
          persistedState.sectionLayouts = defaultSectionLayouts;
        } else {
          persistedState.sectionLayouts = persistedState.sectionLayouts.filter((s: any) => s.id !== 'curated_emporiums');
          const existingIds = new Set(persistedState.sectionLayouts.map((s: any) => s.id));
          for (const defSec of defaultSectionLayouts) {
            if (!existingIds.has(defSec.id)) {
              persistedState.sectionLayouts.push(defSec);
            }
          }
          for (const sec of persistedState.sectionLayouts) {
            if (sec.id === 'combo_products' || sec.id === 'buy1_get1') {
              sec.enabled = true;
            }
          }
        }
        if (!persistedState.combos || persistedState.combos.length === 0 || version < 10) {
          persistedState.combos = defaultSettings.combos;
        }
        if (!persistedState.b1g1Offers || persistedState.b1g1Offers.length === 0 || version < 10) {
          persistedState.b1g1Offers = defaultSettings.b1g1Offers;
        }
        return persistedState;
      },
    }
  )
);
