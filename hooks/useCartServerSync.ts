'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore, CartLine } from '@/store/useCartStore';
import { useProductStore } from '@/store/useProductStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { auth } from '@/lib/firebase';

export function useCartServerSync() {
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

    const saveCart = async (items: CartLine[], removedFreeKeys: string[]) => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      try {
        const res = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items, removedFreeKeys })
        });
        if (!res.ok) {
          let bodyPreview = '';
          try {
            const text = await res.text();
            bodyPreview = text.slice(0, 200);
          } catch {}
          console.error('Save cart error', res.status, res.headers.get('content-type'), bodyPreview);
          return;
        }
        lastSaved.current = JSON.stringify({ items, removedFreeKeys });
      } catch (e) {
        console.error('Save cart error', e);
      }
    };

    if (!userEmail) {
      useCartStore.getState().restoreGuestCart(useProductStore.getState().products);
    } else {
      (async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token || cancelled) return;

          const res = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) {
            let bodyPreview = '';
            try {
              const text = await res.text();
              bodyPreview = text.slice(0, 200);
            } catch {}
            console.error('Load cart error', res.status, res.headers.get('content-type'), bodyPreview);
            return;
          }

          const data = await res.json();
          if (!data.success || cancelled) {
            console.error('Load cart error', data.error);
            return;
          }

          const serverLines = (data.items || []) as CartLine[];
          const serverRemovedKeys = (data.removedFreeKeys || []) as string[];

          if (cancelled) return;

          useCartStore.getState().hydrateFromLines(serverLines, serverRemovedKeys, useProductStore.getState().products);

          const currentStore = useCartStore.getState();
          const currentItems = currentStore.getLines();
          const currentRemoved = currentStore.removedFreeKeys;
          const currentJson = JSON.stringify({ items: currentItems, removedFreeKeys: currentRemoved });
          
          lastSaved.current = currentJson;

          const serverJson = JSON.stringify({ items: serverLines, removedFreeKeys: serverRemovedKeys });
          if (currentJson !== serverJson) {
            await saveCart(currentItems, currentRemoved);
            if (cancelled) return;
          }

          unsub = useCartStore.subscribe((state) => {
            const items = state.getLines();
            const removedFreeKeys = state.removedFreeKeys;
            const jsonStr = JSON.stringify({ items, removedFreeKeys });
            if (jsonStr !== lastSaved.current) {
              if (timer.current) clearTimeout(timer.current);
              timer.current = setTimeout(() => saveCart(items, removedFreeKeys), 600);
            }
          });
        } catch (e) {
          console.error('Load cart error', e);
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
