'use client';

import { useEffect, useRef } from 'react';
import { collection, onSnapshot, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { useProductStore } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

import { normalizeServerProduct } from '@/lib/normalizeProduct';
export { normalizeServerProduct } from '@/lib/normalizeProduct';

/**
 * Client hook that subscribes with onSnapshot to the Firestore 'products' collection.
 * Replaces store products when at least 1 document exists.
 * Falls back to static catalog if empty or offline/error.
 */
export function useProductSync() {
  const setProductsFromServer = useProductStore((state) => state.setProductsFromServer);
  const isAdmin = useAuthStore((state) => state.currentUser?.role === 'admin');
  const warnedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAdmin) {
      if (!db) {
        useSyncStatusStore.getState().markProductsLoaded();
        return;
      }

      const loadedTimer = setTimeout(() => useSyncStatusStore.getState().markProductsLoaded(), 6000);
      let unsubscribe: (() => void) | undefined;

      try {
        const productsCol = collection(db, 'products');
        unsubscribe = onSnapshot(
          productsCol,
          (snapshot) => {
            const serverProducts: Product[] = [];
            const serverIds = new Set<string>();

            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const normalized = normalizeServerProduct(data, docSnap.id);
              serverProducts.push(normalized);
              serverIds.add(docSnap.id);
            });

            if (!snapshot.empty) {
              setProductsFromServer(serverProducts);

              if (snapshot.size < 3) {
                console.warn(`Firestore has only ${snapshot.size} products; run Sync catalog in admin`);
              }
            } else {
              if (!warnedRef.current) {
                console.warn('[useProductSync] Firestore products collection is empty, retaining static fallback.');
                warnedRef.current = true;
              }
            }

            const serverCount = serverProducts.length;
            const staticCount = initialProducts.length;
            const missingStaticIds = initialProducts
              .filter((p) => !serverIds.has(p.id))
              .map((p) => p.id)
              .slice(0, 25);

            console.info('[ProductSync]', { serverCount, staticCount, missingStaticIds });
            useSyncStatusStore.getState().markProductsLoaded();
          },
          (error) => {
            if (!warnedRef.current) {
              console.warn('[useProductSync] Firestore products listener warning:', error.message);
              warnedRef.current = true;
            }
            useSyncStatusStore.getState().markProductsLoaded();
          }
        );
      } catch (err: any) {
        if (!warnedRef.current) {
          console.warn('[useProductSync] Initialization notice:', err?.message || err);
          warnedRef.current = true;
        }
        useSyncStatusStore.getState().markProductsLoaded();
      }

      return () => {
        clearTimeout(loadedTimer);
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }

    let cancelled = false;
    let lastLoadAt = 0;
    const loadedTimer = setTimeout(() => useSyncStatusStore.getState().markProductsLoaded(), 6000);

    async function load() {
      lastLoadAt = Date.now();
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const list = Array.isArray(data?.products) ? data.products : [];
        if (list.length > 0 && !cancelled) {
          if (JSON.stringify(list) !== JSON.stringify(useProductStore.getState().products)) {
            setProductsFromServer(list);
          }
        }
      } catch (err: any) {
        if (!warnedRef.current) {
          console.warn('[useProductSync] Fetch products warning:', err?.message || err);
          warnedRef.current = true;
        }
      } finally {
        useSyncStatusStore.getState().markProductsLoaded();
      }
    }

    load();

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load();
      }
    }, 600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoadAt > 300000) {
        load();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(loadedTimer);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setProductsFromServer, isAdmin]);
}

/**
 * Admin action helper to sync master static products into Firestore collection 'products'.
 * Writes in batches of max 400.
 * ONLY writes products whose IDs do not already exist in Firestore (never overwrites existing docs).
 * Returns { added: number, skipped: number }.
 */
export async function seedProductsToFirestore(): Promise<{ added: number; skipped: number }> {
  if (!db) {
    throw new Error('Firestore database connection is not available.');
  }

  try {
    const productsCol = collection(db, 'products');
    const existingSnap = await getDocs(productsCol);
    const existingIds = new Set<string>();
    existingSnap.forEach((d) => existingIds.add(d.id));

    const toAdd = initialProducts.filter((p) => !existingIds.has(p.id));
    const skipped = initialProducts.length - toAdd.length;

    if (toAdd.length === 0) {
      return { added: 0, skipped };
    }

    const BATCH_SIZE = 400;
    for (let i = 0; i < toAdd.length; i += BATCH_SIZE) {
      const chunk = toAdd.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const prod of chunk) {
        const docRef = doc(db, 'products', prod.id);
        const sanitized = sanitizeForFirestore(prod);
        batch.set(docRef, sanitized);
      }
      await batch.commit();
    }

    return { added: toAdd.length, skipped };
  } catch (error: any) {
    console.error('[seedProductsToFirestore] Sync catalog error:', error);
    throw error;
  }
}
