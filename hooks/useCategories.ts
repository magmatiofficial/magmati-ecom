'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';
import { useCategoryStore } from '@/store/useCategoryStore';
import { CategoryItem } from '@/types';

export const CategoriesInitialContext = createContext<CategoryItem[] | null>(null);

export function useCategories() {
  const ctx = useContext(CategoriesInitialContext);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const live = useCategoryStore();
  return hydrated
    ? { categories: live.categories, categoriesLoaded: live.categoriesLoaded }
    : { categories: ctx ?? [], categoriesLoaded: ctx !== null };
}
