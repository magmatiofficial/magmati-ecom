'use client';

import { create } from 'zustand';
import { CategoryItem, SubCategoryItem } from '@/types';
import { categories as initialCategories } from '@/data/products';
import { db, sanitizeForFirestore } from '@/lib/firebase';
import { setDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { revalidateStorefrontCache } from '@/lib/revalidateStorefront';

export const DEFAULT_CATEGORY_PLACEHOLDER = '/placeholder-category.svg';

interface CategoryState {
  categories: CategoryItem[];
  categoriesLoaded: boolean;
  categoryError: string | null;
  setCategoriesFromServer: (list: CategoryItem[]) => void;
  markCategoriesLoaded: () => void;
  clearCategoryError: () => void;
  addCategory: (category: Omit<CategoryItem, 'id' | 'itemCount'>) => Promise<void>;
  updateCategory: (id: string, updatedFields: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, subcategory: { name: string }) => Promise<void>;
  updateSubcategory: (categoryId: string, subId: string, subData: { name: string }) => Promise<void>;
  deleteSubcategory: (categoryId: string, subId: string) => Promise<void>;
  importDefaultCategories: () => Promise<{ added: number; skipped: number }>;
}

export { initialCategories };

export const useCategoryStore = create<CategoryState>()(
  (set, get) => ({
    categories: [],
    categoriesLoaded: false,
    categoryError: null,

    setCategoriesFromServer: (list) => {
      set({ categories: list, categoriesLoaded: true });
    },

    markCategoriesLoaded: () => {
      set({ categoriesLoaded: true });
    },

    clearCategoryError: () => {
      set({ categoryError: null });
    },

    addCategory: async (newCategoryData) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
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

        await setDoc(doc(db, 'categories', id), sanitizeForFirestore(newCategory));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error adding category:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    updateCategory: async (id, updatedFields) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
        const existing = get().categories.find((c) => c.id === id);
        if (!existing) return;
        const updated = { ...existing, ...updatedFields };
        if (updatedFields.image !== undefined) {
          updated.image = (updatedFields.image && updatedFields.image.trim().length > 0)
            ? updatedFields.image.trim()
            : DEFAULT_CATEGORY_PLACEHOLDER;
        }
        await setDoc(doc(db, 'categories', id), sanitizeForFirestore(updated));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error updating category:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    deleteCategory: async (id) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
        await deleteDoc(doc(db, 'categories', id));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error deleting category:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    addSubcategory: async (categoryId, subcategory) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
        const cat = get().categories.find((c) => c.id === categoryId);
        if (!cat) return;
        const newSub: SubCategoryItem = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: subcategory.name.trim(),
          slug: subcategory.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        };
        const currentSubs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
        const updated = {
          ...cat,
          subcategories: [...currentSubs, newSub],
        };
        await setDoc(doc(db, 'categories', categoryId), sanitizeForFirestore(updated));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error adding subcategory:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    updateSubcategory: async (categoryId, subId, subData) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
        const cat = get().categories.find((c) => c.id === categoryId);
        if (!cat || !cat.subcategories) return;
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
        const updated = { ...cat, subcategories: updatedSubs };
        await setDoc(doc(db, 'categories', categoryId), sanitizeForFirestore(updated));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error updating subcategory:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    deleteSubcategory: async (categoryId, subId) => {
      if (!db) {
        set({ categoryError: 'Database is not ready.' });
        return;
      }
      try {
        const cat = get().categories.find((c) => c.id === categoryId);
        if (!cat || !cat.subcategories) return;
        const filteredSubs = cat.subcategories.filter((s) => {
          if (typeof s === 'string') return s !== subId;
          return s.id !== subId;
        });
        const updated = { ...cat, subcategories: filteredSubs };
        await setDoc(doc(db, 'categories', categoryId), sanitizeForFirestore(updated));
        revalidateStorefrontCache();
        set({ categoryError: null });
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        set({ categoryError: 'Could not save the category. Please try again.' });
      }
    },

    importDefaultCategories: async () => {
      if (!db) throw new Error('Database not initialized');
      const currentCategories = get().categories;
      const existingIds = new Set(currentCategories.map(c => c.id));

      let added = 0;
      let skipped = 0;

      const batch = writeBatch(db);
      
      for (const cat of initialCategories) {
        if (existingIds.has(cat.id)) {
          skipped++;
          continue;
        }

        const categoryRef = doc(db, 'categories', cat.id);
        batch.set(categoryRef, sanitizeForFirestore(cat));
        added++;
      }

      if (added > 0) {
        await batch.commit();
        revalidateStorefrontCache();
      }

      return { added, skipped };
    },
  })
);

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('magmati-mart-category-store-v4');
  } catch (e) {}
}
