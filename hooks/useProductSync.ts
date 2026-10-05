'use client';

import { useEffect, useRef } from 'react';
import { collection, onSnapshot, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

/**
 * Normalizes a server product document by:
 * 1. Starting from the static product with the same id (from data/products.ts) if it exists.
 * 2. Applying Firestore document fields on top (server values win over static ones when they exist).
 * 3. Guaranteeing every required field of the Product type has a safe default:
 *    - rating 0, reviewCount 0
 *    - arrays [] for sizes/colors/images/tags (and details)
 *    - price 0
 *    - inStock true
 *    - stockQuantity 0 only if missing and no static value
 *    - strings '' (name, slug, category, subcategory, description, brand, sku)
 */
export function normalizeServerProduct(data: any, id: string): Product {
  const staticProduct = initialProducts.find((p) => p.id === id);

  const serverFields: Record<string, any> = {};
  if (data && typeof data === 'object') {
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        serverFields[key] = val;
      }
    }
  }

  const base = staticProduct ? { ...staticProduct, ...serverFields, id } : { ...serverFields, id };

  const rating = typeof serverFields.rating === 'number'
    ? serverFields.rating
    : (typeof staticProduct?.rating === 'number' ? staticProduct.rating : 0);

  const reviewCount = typeof serverFields.reviewCount === 'number'
    ? serverFields.reviewCount
    : (typeof staticProduct?.reviewCount === 'number' ? staticProduct.reviewCount : 0);

  const price = typeof serverFields.price === 'number'
    ? serverFields.price
    : (typeof staticProduct?.price === 'number' ? staticProduct.price : 0);

  const inStock = typeof serverFields.inStock === 'boolean'
    ? serverFields.inStock
    : (typeof staticProduct?.inStock === 'boolean' ? staticProduct.inStock : true);

  const stockQuantity = typeof serverFields.stockQuantity === 'number'
    ? serverFields.stockQuantity
    : (typeof staticProduct?.stockQuantity === 'number' ? staticProduct.stockQuantity : 0);

  const sizes = Array.isArray(serverFields.sizes)
    ? serverFields.sizes
    : (Array.isArray(staticProduct?.sizes) ? staticProduct.sizes : []);

  const colors = Array.isArray(serverFields.colors)
    ? serverFields.colors
    : (Array.isArray(staticProduct?.colors) ? staticProduct.colors : []);

  const images = Array.isArray(serverFields.images)
    ? serverFields.images
    : (Array.isArray(staticProduct?.images) ? staticProduct.images : []);

  const tags = Array.isArray(serverFields.tags)
    ? serverFields.tags
    : (Array.isArray((staticProduct as any)?.tags) ? (staticProduct as any).tags : []);

  const details = Array.isArray(serverFields.details)
    ? serverFields.details
    : (Array.isArray(staticProduct?.details) ? staticProduct.details : []);

  const name = typeof serverFields.name === 'string'
    ? serverFields.name
    : (typeof staticProduct?.name === 'string' ? staticProduct.name : '');

  const slug = typeof serverFields.slug === 'string'
    ? serverFields.slug
    : (typeof staticProduct?.slug === 'string' ? staticProduct.slug : id);

  const category = typeof serverFields.category === 'string'
    ? serverFields.category
    : (typeof staticProduct?.category === 'string' ? staticProduct.category : '');

  const subcategory = typeof serverFields.subcategory === 'string'
    ? serverFields.subcategory
    : (typeof staticProduct?.subcategory === 'string' ? staticProduct.subcategory : '');

  const description = typeof serverFields.description === 'string'
    ? serverFields.description
    : (typeof staticProduct?.description === 'string' ? staticProduct.description : '');

  const brand = typeof serverFields.brand === 'string'
    ? serverFields.brand
    : (typeof staticProduct?.brand === 'string' ? staticProduct.brand : '');

  const sku = typeof serverFields.sku === 'string'
    ? serverFields.sku
    : (typeof staticProduct?.sku === 'string' ? staticProduct.sku : id);

  return {
    ...base,
    id,
    name,
    slug,
    category,
    subcategory,
    price,
    rating,
    reviewCount,
    images,
    sizes,
    colors,
    tags,
    details,
    inStock,
    stockQuantity,
    description,
    brand,
    sku,
  } as unknown as Product;
}

/**
 * Client hook that subscribes with onSnapshot to the Firestore 'products' collection.
 * Replaces store products when at least 1 document exists.
 * Falls back to static catalog if empty or offline/error.
 */
export function useProductSync() {
  const setProductsFromServer = useProductStore((state) => state.setProductsFromServer);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !db) return;

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
        },
        (error) => {
          if (!warnedRef.current) {
            console.warn('[useProductSync] Firestore products listener warning:', error.message);
            warnedRef.current = true;
          }
        }
      );
    } catch (err: any) {
      if (!warnedRef.current) {
        console.warn('[useProductSync] Initialization notice:', err?.message || err);
        warnedRef.current = true;
      }
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [setProductsFromServer]);
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
