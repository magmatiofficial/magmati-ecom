'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategoryItem, SubCategoryItem } from '@/types';
import { categories as initialCategories } from '@/data/products';

export const DEFAULT_CATEGORY_PLACEHOLDER = '/placeholder-category.svg';

interface CategoryState {
  categories: CategoryItem[];
  addCategory: (category: Omit<CategoryItem, 'id' | 'itemCount'>) => void;
  updateCategory: (id: string, updatedFields: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, subcategory: { name: string }) => void;
  updateSubcategory: (categoryId: string, subId: string, subData: { name: string }) => void;
  deleteSubcategory: (categoryId: string, subId: string) => void;
  resetCategories: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: initialCategories,

      addCategory: (newCategoryData) => {
        const id = `cat-${Date.now()}`;
        const slug = newCategoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const finalImage = (newCategoryData.image && newCategoryData.image.trim().length > 0)
          ? newCategoryData.image.trim()
          : DEFAULT_CATEGORY_PLACEHOLDER;

        const newCategory: CategoryItem = {
          ...newCategoryData,
          id,
          slug,
          image: finalImage,
          itemCount: 0,
          subcategories: newCategoryData.subcategories || [],
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updatedFields) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            if (c.id !== id) return c;
            const updated = { ...c, ...updatedFields };
            if (updatedFields.image !== undefined) {
              updated.image = (updatedFields.image && updatedFields.image.trim().length > 0)
                ? updatedFields.image.trim()
                : DEFAULT_CATEGORY_PLACEHOLDER;
            }
            return updated;
          }),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addSubcategory: (categoryId, subcategory) => {
        set((state) => ({
          categories: state.categories.map((cat) => {
            if (cat.id !== categoryId) return cat;
            const newSub: SubCategoryItem = {
              id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: subcategory.name.trim(),
              slug: subcategory.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
            };
            const currentSubs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
            return {
              ...cat,
              subcategories: [...currentSubs, newSub],
            };
          }),
        }));
      },

      updateSubcategory: (categoryId, subId, subData) => {
        set((state) => ({
          categories: state.categories.map((cat) => {
            if (cat.id !== categoryId || !cat.subcategories) return cat;
            const updatedSubs = cat.subcategories.map((s) => {
              if (typeof s === 'string') {
                if (s === subId) {
                  return {
                    id: `sub-${Date.now()}`,
                    name: subData.name.trim(),
                  };
                }
                return s;
              }
              if (s.id === subId) {
                return {
                  ...s,
                  name: subData.name.trim(),
                  slug: subData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
                };
              }
              return s;
            });
            return { ...cat, subcategories: updatedSubs };
          }),
        }));
      },

      deleteSubcategory: (categoryId, subId) => {
        set((state) => ({
          categories: state.categories.map((cat) => {
            if (cat.id !== categoryId || !cat.subcategories) return cat;
            const filteredSubs = cat.subcategories.filter((s) => {
              if (typeof s === 'string') return s !== subId;
              return s.id !== subId;
            });
            return { ...cat, subcategories: filteredSubs };
          }),
        }));
      },

      resetCategories: () => {
        set({ categories: initialCategories });
      },
    }),
    {
      name: 'magmati-mart-category-store-v4',
    }
  )
);
