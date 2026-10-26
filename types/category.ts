/**
 * @file types/category.ts
 * @description Category models and nested hierarchy representations (Parent Category, Subcategories & Child links).
 */

export interface SubCategoryItem {
  id: string;
  name: string;
  slug?: string;
  link?: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  iconName?: string;
  itemCount: number;
  subcategories?: (string | SubCategoryItem)[];
}

export interface SubCategory {
  id: string;
  name: string;
  parentCategoryId: string;
}
