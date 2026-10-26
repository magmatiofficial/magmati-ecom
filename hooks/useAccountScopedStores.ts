'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistServerSync } from '@/hooks/useWishlistServerSync';
import { useCartServerSync } from '@/hooks/useCartServerSync';

export function useAccountScopedStores() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const userEmail = useAuthStore((s) => s.currentUser?.email);

  useEffect(() => {
    if (!isAuthReady) return;
    useWishlistStore.getState().setOwner(userEmail ?? null);
    useCartStore.getState().setOwner(userEmail ?? null);
  }, [isAuthReady, userEmail]);

  useWishlistServerSync();
  useCartServerSync();
}

