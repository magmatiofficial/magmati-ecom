'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
export type { Product } from '@/types';
import { products as initialProducts } from '@/data/products';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, runTransaction } from 'firebase/firestore';

interface ProductState {
  products: Product[];
  setProductsFromServer: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  bulkAddProducts: (newProducts: Product[]) => void;
  replaceProducts: (allProducts: Product[]) => void;
  updateProduct: (productId: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  quickAdjustStock: (productId: string, delta: number) => void;
  resetToDefault: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: initialProducts,

      setProductsFromServer: (serverProducts) => {
        set({ products: serverProducts });
      },

      addProduct: (newProductData) => {
        const generatedId = `prod-${Date.now()}`;
        const finalProduct: Product = {
          ...newProductData,
          id: generatedId,
        };
        set((state) => ({
          products: [finalProduct, ...state.products],
        }));
        if (db) {
          setDoc(doc(db, 'products', generatedId), sanitizeForFirestore(finalProduct))
            .catch((e) => console.error('Product save failed', e));
        }
      },

      bulkAddProducts: (newProducts) => {
        set((state) => {
          // Deduplicate by ID or SKU
          const existingIds = new Set(state.products.map((p) => p.id));
          
          const validNewProducts = newProducts.map((p, idx) => {
            let pid = p.id;
            if (!pid || existingIds.has(pid)) {
              pid = `prod-${Date.now()}-${idx}`;
            }
            return {
              ...p,
              id: pid,
            };
          });

          return {
            products: [...validNewProducts, ...state.products],
          };
        });
      },

      replaceProducts: (allProducts) => {
        set({ products: allProducts });
      },

      updateProduct: (productId, updatedFields) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, ...updatedFields } : p
          ),
        }));
        if (db) {
          const updatedItem = get().products.find((p) => p.id === productId);
          if (updatedItem) {
            setDoc(doc(db, 'products', productId), sanitizeForFirestore(updatedItem), { merge: true })
              .catch((e) => console.error('Product save failed', e));
          }
        }
      },

      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        if (db) {
          deleteDoc(doc(db, 'products', productId))
            .catch((e) => console.error('Product save failed', e));
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

