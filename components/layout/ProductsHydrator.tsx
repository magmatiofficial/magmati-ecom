'use client';

import { useLayoutEffect } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { ProductsInitialContext } from '@/hooks/useProducts';
import { Product } from '@/types';

interface ProductsHydratorProps {
  initial: Product[];
  children: React.ReactNode;
}

export function ProductsHydrator({ initial, children }: ProductsHydratorProps) {
  useLayoutEffect(() => {
    if (initial && initial.length > 0) {
      if (useProductStore.getState().products.length === 0) {
        useProductStore.getState().setProductsFromServer(initial);
      }
      useSyncStatusStore.getState().markProductsLoaded();
    }
  }, [initial]);

  return (
    <ProductsInitialContext.Provider value={initial}>
      {children}
    </ProductsInitialContext.Provider>
  );
}
