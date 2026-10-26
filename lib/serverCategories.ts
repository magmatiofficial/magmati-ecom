import { getStorefrontData } from '@/lib/serverStorefront';
import { CategoryItem } from '@/types';

export async function getCategories(): Promise<CategoryItem[] | null> {
  const data = await getStorefrontData();
  if (!data) return null;
  return data.categories as unknown as CategoryItem[];
}
