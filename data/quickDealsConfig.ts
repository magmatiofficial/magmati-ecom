// Default tabs shown instantly on first paint. Live edits are saved from Admin to the server; use Admin > Export to paste the latest config here.

import type { QuickDealsConfig } from '@/store/useSiteSettingsStore';

export const QUICK_DEALS_DEFAULT: QuickDealsConfig = {
  title: 'Quick Deal',
  tabs: [
    { id: 'today', label: "Today's Deal", type: 'products', enabled: true, productIds: [] },
    { id: 'combo', label: 'Combo Deals', type: 'combos', enabled: true, productIds: [] },
    { id: 'b1g1', label: 'Buy 1 Get 1', type: 'b1g1', enabled: true, productIds: [] },
    { id: 'free-shipping', label: 'Free Shipping', type: 'products', enabled: true, productIds: [] },
    { id: 'best-price', label: 'Best Price', type: 'products', enabled: true, productIds: [] },
  ],
};
