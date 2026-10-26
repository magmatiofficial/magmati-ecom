'use client';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useProductStore } from '@/store/useProductStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { auth } from '@/lib/firebase';

export function useWishlistServerSync() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const userEmail = useAuthStore((s) => s.currentUser?.email);
  const productsLoaded = useSyncStatusStore((s) => s.productsLoaded);
  const hasProducts = useProductStore((s) => s.products.length > 0);
  const productsReady = productsLoaded && hasProducts;
  const lastSaved = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isAuthReady || !productsReady) return;
    
    let cancelled = false;
    let unsub: (() => void) | undefined;

    const saveWishlist = async (ids: string[]) => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      try {
        const res = await fetch('/api/wishlist', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productIds: ids })
        });
        if (!res.ok) {
          console.error('Save wishlist error', res.status);
          return;
        }
        lastSaved.current = [...ids].sort().join(',');
      } catch (e) {
        console.error('Save wishlist error', e);
      }
    };

    if (!userEmail) {
      // Guest
      const wishlist = useWishlistStore.getState();
      wishlist.hydrateFromIds(wishlist.guestProductIds, useProductStore.getState().products);
    } else {
      // Logged-in
      (async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token || cancelled) return;

          const res = await fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) {
            console.error('Load wishlist error', res.status);
            return;
          }

          const data = await res.json();
          if (!data.success || cancelled) {
            console.error('Load wishlist error', data.error);
            return;
          }

          const serverIds = data.productIds as string[];
          const localIds = useWishlistStore.getState().getProductIds();
          const merged = [...serverIds, ...localIds.filter(id => !serverIds.includes(id))];

          useWishlistStore.getState().hydrateFromIds(merged, useProductStore.getState().products);
          lastSaved.current = [...merged].sort().join(',');

          if (merged.length > serverIds.length) {
            await saveWishlist(merged);
            if (cancelled) return;
          }

          unsub = useWishlistStore.subscribe((state) => {
            const ids = state.getProductIds();
            const idsString = [...ids].sort().join(',');
            if (idsString !== lastSaved.current) {
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => saveWishlist(ids), 600);
            }
          });
        } catch (e) {
          console.error('Load wishlist error', e);
        }
      })();
    }

    return () => {
      cancelled = true;
      if (unsub) unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isAuthReady, userEmail, productsReady]);
}
