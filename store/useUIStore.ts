'use client';

import { create } from 'zustand';

interface UIState {
  isCategoryDrawerOpen: boolean;
  isSearchOpen: boolean;
  isFilterDrawerOpen: boolean;
  isAdminPanelActive: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openCategoryDrawer: () => void;
  closeCategoryDrawer: () => void;
  toggleCategoryDrawer: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  toggleFilterDrawer: () => void;
  setIsAdminPanelActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCategoryDrawerOpen: false,
  isSearchOpen: false,
  isFilterDrawerOpen: false,
  isAdminPanelActive: false,
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  openCategoryDrawer: () => set({ isCategoryDrawerOpen: true }),
  closeCategoryDrawer: () => set({ isCategoryDrawerOpen: false }),
  toggleCategoryDrawer: () => set((state) => ({ isCategoryDrawerOpen: !state.isCategoryDrawerOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openFilterDrawer: () => set({ isFilterDrawerOpen: true }),
  closeFilterDrawer: () => set({ isFilterDrawerOpen: false }),
  toggleFilterDrawer: () => set((state) => ({ isFilterDrawerOpen: !state.isFilterDrawerOpen })),
  setIsAdminPanelActive: (isAdminPanelActive) => set({ isAdminPanelActive }),
}));
