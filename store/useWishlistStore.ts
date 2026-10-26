'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
  ownerEmail: string;
  guestProductIds: string[];
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
  setOwner: (email?: string | null) => void;
  hydrateFromIds: (ids: string[], products: Product[]) => void;
  getProductIds: () => string[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      guestProductIds: [],
      ownerEmail: 'guest',
      isWishlistOpen: false,

      openWishlist: () => set({ isWishlistOpen: true }),
      closeWishlist: () => set({ isWishlistOpen: false }),
      toggleWishlistDrawer: () => set((state) => ({ isWishlistOpen: !state.isWishlistOpen })),

      toggleWishlist: (product: Product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          const nextItems = exists 
            ? state.items.filter((item) => item.id !== product.id)
            : [...state.items, product];
          
          return {
            items: nextItems,
            guestProductIds: state.ownerEmail === 'guest' ? nextItems.map(i => i.id) : [],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== productId);
          return {
            items: nextItems,
            guestProductIds: state.ownerEmail === 'guest' ? nextItems.map(i => i.id) : [],
          };
        });
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => set({ items: [], guestProductIds: [] }),

      getTotalItems: () => get().items.length,

      setOwner: (email?: string | null) => {
        const key = email && email.trim() ? email.toLowerCase().trim() : 'guest';
        const currentOwner = get().ownerEmail;
        if (key === currentOwner) return;

        if (currentOwner === 'guest' && key !== 'guest') {
          // guest items are adopted by the account, keep items, clear guestProductIds
          set({ ownerEmail: key, guestProductIds: [] });
        } else {
          // other user, or user -> guest logout
          set({ ownerEmail: key, items: [], guestProductIds: [] });
        }
      },

      hydrateFromIds: (ids: string[], products: Product[]) => {
        const uniqueIds = [...new Set(ids)];
        const nextItems = uniqueIds
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => !!p);

        set((state) => ({
          items: nextItems,
          guestProductIds: state.ownerEmail === 'guest' ? nextItems.map(i => i.id) : [],
        }));
      },

      getProductIds: () => get().items.map((item) => item.id),
    }),
    {
      name: 'magmati-wishlist-storage-v3',
      partialize: (s) => ({ guestProductIds: s.ownerEmail === 'guest' ? s.guestProductIds : [] }),
    }
  )
);
