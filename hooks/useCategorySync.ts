'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchStorefront } from '@/lib/clientStorefront';
import { CategoryItem } from '@/types';

export function useCategorySync() {
  const setCategoriesFromServer = useCategoryStore((state) => state.setCategoriesFromServer);
  const markCategoriesLoaded = useCategoryStore((state) => state.markCategoriesLoaded);
  const isAdmin = useAuthStore((s) => s.currentUser?.role === 'admin');

  useEffect(() => {
    // Admin: live listener, so the admin panel always shows the newest data.
    if (isAdmin) {
      if (!db) return;
      const unsubscribe = onSnapshot(query(collection(db, 'categories')), (snapshot) => {
        const serverCategories: CategoryItem[] = [];
        snapshot.forEach((doc) => {
          serverCategories.push({ id: doc.id, ...doc.data() } as CategoryItem);
        });
        setCategoriesFromServer(serverCategories);
      }, (error) => {
        console.error('[CategorySync] Firestore subscription error:', error);
        markCategoriesLoaded();
      });

      return () => unsubscribe();
    }

    // Visitors: one shared cached request. Only if it fails, read Firestore once directly.
    let cancelled = false;
    fetchStorefront().then(async (data) => {
      if (cancelled) return;
      if (data) {
        setCategoriesFromServer(data.categories as unknown as CategoryItem[]);
        return;
      }
      if (!db) {
        markCategoriesLoaded();
        return;
      }
      try {
        const snapshot = await getDocs(query(collection(db, 'categories')));
        if (cancelled) return;
        const serverCategories: CategoryItem[] = [];
        snapshot.forEach((doc) => {
          serverCategories.push({ id: doc.id, ...doc.data() } as CategoryItem);
        });
        setCategoriesFromServer(serverCategories);
      } catch (error) {
        if (cancelled) return;
        console.error('[CategorySync] Firestore fetch error:', error);
        markCategoriesLoaded();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setCategoriesFromServer, markCategoriesLoaded, isAdmin]);
}
