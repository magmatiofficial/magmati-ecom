'use client';

import { create } from 'zustand';

export interface SyncStatusState {
  settingsLoaded: boolean;
  markSettingsLoaded: () => void;
  productsLoaded: boolean;
  markProductsLoaded: () => void;
}

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  settingsLoaded: false,
  markSettingsLoaded: () => set({ settingsLoaded: true }),
  productsLoaded: false,
  markProductsLoaded: () => set({ productsLoaded: true }),
}));
