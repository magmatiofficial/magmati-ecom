import { unstable_cache } from 'next/cache';
import { adminDb } from '@/lib/firebaseAdmin';
import { normalizeServerProduct } from '@/lib/normalizeProduct';
import { Product } from '@/types';

const cachedProducts = unstable_cache(
  async () => {
    if (!adminDb) throw new Error('adminDb unavailable');
    const snap = await adminDb.collection('products').get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => normalizeServerProduct(d.data(), d.id)))) as Product[];
  },
  ['home-products'],
  { revalidate: 600, tags: ['products'] }
);

export async function getProducts(): Promise<Product[]> {
  try {
    return await cachedProducts();
  } catch (err) {
    console.error('Failed to get products:', err instanceof Error ? err.message : String(err));
    return [];
  }
}
