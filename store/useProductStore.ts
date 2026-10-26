'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
export type { Product } from '@/types';
import { products as initialProducts } from '@/data/products';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, runTransaction, deleteField, writeBatch } from 'firebase/firestore';
import { revalidateProductsCache } from '@/lib/revalidateProducts';

interface ProductState {
  products: Product[];
  setProductsFromServer: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  bulkAddProducts: (newProducts: Product[]) => Promise<{ added: number; skipped: number; failed: boolean }>;
  updateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  quickAdjustStock: (productId: string, delta: number) => void;
  resetToDefault: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      setProductsFromServer: (serverProducts) => {
        set({ products: serverProducts });
      },

      addProduct: async (newProductData) => {
        const generatedId = `prod-${Date.now()}`;
        const finalProduct: Product = {
          ...newProductData,
          id: generatedId,
        };
        set((state) => ({
          products: [finalProduct, ...state.products],
        }));
        if (!db) {
          console.error('Product save failed: Database connection unavailable');
          set((state) => ({
            products: state.products.filter((p) => p.id !== generatedId),
          }));
          return false;
        }
        try {
          await setDoc(doc(db, 'products', generatedId), sanitizeForFirestore(finalProduct));
          revalidateProductsCache();
          return true;
        } catch (e) {
          console.error('Product save failed', e);
          set((state) => ({
            products: state.products.filter((p) => p.id !== generatedId),
          }));
          return false;
        }
      },

      bulkAddProducts: async (newProducts) => {
        if (!db) {
          console.error('Bulk product import failed: Database connection unavailable');
          return { added: 0, skipped: 0, failed: true };
        }

        const existingProducts = get().products;
        const existingIds = new Set(existingProducts.map((p) => p.id).filter(Boolean));
        const existingSkus = new Set(
          existingProducts
            .map((p) => p.sku?.trim().toLowerCase())
            .filter((s): s is string => Boolean(s))
        );

        const seenIds = new Set<string>();
        const seenSkus = new Set<string>();
        const toAdd: Product[] = [];
        let skipped = 0;

        for (let idx = 0; idx < newProducts.length; idx++) {
          const p = newProducts[idx];
          const prodId = p.id || `prod-imp-${Date.now()}-${idx}`;
          const prodWithId: Product = p.id ? p : { ...p, id: prodId };
          const skuClean = prodWithId.sku?.trim().toLowerCase();

          const isDuplicateId = Boolean(prodId && (existingIds.has(prodId) || seenIds.has(prodId)));
          const isDuplicateSku = Boolean(skuClean && (existingSkus.has(skuClean) || seenSkus.has(skuClean)));

          if (isDuplicateId || isDuplicateSku) {
            skipped += 1;
            continue;
          }

          if (prodId) seenIds.add(prodId);
          if (skuClean) seenSkus.add(skuClean);
          toAdd.push(prodWithId);
        }

        if (toAdd.length === 0) {
          return { added: 0, skipped, failed: false };
        }

        try {
          const BATCH_SIZE = 400;
          for (let i = 0; i < toAdd.length; i += BATCH_SIZE) {
            const chunk = toAdd.slice(i, i + BATCH_SIZE);
            const batch = writeBatch(db);
            for (const prod of chunk) {
              const docRef = doc(db, 'products', prod.id);
              batch.set(docRef, sanitizeForFirestore(prod));
            }
            await batch.commit();
          }

          set((state) => ({
            products: [...toAdd, ...state.products],
          }));

          revalidateProductsCache();
          return { added: toAdd.length, skipped, failed: false };
        } catch (e) {
          console.error('Bulk product import failed', e);
          return { added: 0, skipped, failed: true };
        }
      },

      updateProduct: async (productId, updatedFields) => {
        const prevProduct = get().products.find((p) => p.id === productId);
        if (!prevProduct) {
          console.error(`Product update failed: Product #${productId} not found`);
          return false;
        }
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, ...updatedFields } : p
          ),
        }));
        if (!db) {
          console.error('Product save failed: Database connection unavailable');
          set((state) => ({
            products: state.products.map((p) =>
              p.id === productId ? prevProduct : p
            ),
          }));
          return false;
        }
        try {
          const updatedItem = get().products.find((p) => p.id === productId);
          if (updatedItem) {
            const firestorePayload: Record<string, unknown> = sanitizeForFirestore(updatedItem) as unknown as Record<string, unknown>;
            // A field explicitly cleared (set to undefined) must be removed from Firestore, not silently kept
            for (const [key, value] of Object.entries(updatedFields)) {
              if (value === undefined) firestorePayload[key] = deleteField();
            }
            await setDoc(doc(db, 'products', productId), firestorePayload, { merge: true });
            revalidateProductsCache();
          }
          return true;
        } catch (e) {
          console.error('Product save failed', e);
          set((state) => ({
            products: state.products.map((p) =>
              p.id === productId ? prevProduct : p
            ),
          }));
          return false;
        }
      },

      deleteProduct: async (productId) => {
        const prevProducts = get().products;
        const prevIndex = prevProducts.findIndex((p) => p.id === productId);
        if (prevIndex === -1) {
          console.error(`Product delete failed: Product #${productId} not found`);
          return false;
        }
        const prevProduct = prevProducts[prevIndex];
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        if (!db) {
          console.error('Product delete failed: Database connection unavailable');
          set((state) => {
            const restored = [...state.products];
            restored.splice(prevIndex, 0, prevProduct);
            return { products: restored };
          });
          return false;
        }
        try {
          await deleteDoc(doc(db, 'products', productId));
          revalidateProductsCache();
          return true;
        } catch (e) {
          console.error('Product save failed', e);
          set((state) => {
            const restored = [...state.products];
            restored.splice(prevIndex, 0, prevProduct);
            return { products: restored };
          });
          return false;
        }
      },

      quickAdjustStock: async (productId, delta) => {
        // 1. Immediate local state update for instant UI feedback
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const currentQty = p.stockQuantity ?? 10;
            const newQty = Math.max(0, currentQty + delta);
            return {
              ...p,
              stockQuantity: newQty,
              inStock: newQty > 0,
            };
          }),
        }));

        // 2. Atomic Firestore transaction for database consistency
        if (db) {
          try {
            const productRef = doc(db, 'products', productId);
            await runTransaction(db, async (transaction) => {
              const sfDoc = await transaction.get(productRef);
              if (!sfDoc.exists()) {
                return;
              }
              const currentStock = sfDoc.data().stockQuantity ?? 10;
              const newStock = Math.max(0, currentStock + delta);
              transaction.update(productRef, {
                stockQuantity: newStock,
                inStock: newStock > 0,
              });
            });
            revalidateProductsCache();
          } catch (e) {
            console.warn('Firestore transaction stock adjustment notice:', e);
          }
        }
      },

      resetToDefault: () => {
        set({ products: initialProducts });
      },
    }),
    {
      name: 'magmati-mart-product-store',
      // Do not persist products to localStorage so live Firestore server data is always fresh and authoritative
      partialize: () => ({}),
    }
  )
);

