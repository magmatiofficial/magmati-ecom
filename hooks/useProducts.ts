'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import { Product } from '@/types';
import { useProductStore } from '@/store/useProductStore';

export const ProductsInitialContext = createContext<Product[] | null>(null);

export function useProducts(): { products: Product[] } {
  const ctx = useContext(ProductsInitialContext);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const live = useProductStore();

  if (!ctx || ctx.length === 0) return { products: live.products };
  return { products: hydrated && live.products.length > 0 ? live.products : ctx };
}
