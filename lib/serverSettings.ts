import { getStorefrontData } from '@/lib/serverStorefront';
import { stripRetiredSections } from './sectionLayouts';

export async function getStorefrontSettings(): Promise<Record<string, unknown> | null> {
  const data = await getStorefrontData();
  if (!data || !data.settings) return null;
  return stripRetiredSections(data.settings);
}
