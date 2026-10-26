import { unstable_cache } from 'next/cache';
import { adminDb, isAdminDbReady } from '@/lib/firebaseAdmin';

export interface StorefrontData {
  categories: Array<{ id: string } & Record<string, unknown>>;
  vouchers: Array<{ id: string } & Record<string, unknown>>;
  maxVouchersPerOrder: number | null;
  settings: Record<string, unknown> | null;
}

const cachedStorefront = unstable_cache(
  async (): Promise<StorefrontData> => {
    if (!isAdminDbReady || !adminDb) throw new Error('adminDb unavailable');

    const [categoriesSnap, vouchersSnap, publicSettingsDoc, storefrontDoc] = await Promise.all([
      adminDb.collection('categories').get(),
      adminDb.collection('vouchers').get(),
      adminDb.collection('public_settings').doc('vouchers').get(),
      adminDb.collection('site_settings').doc('storefront').get(),
    ]);

    const categories = categoriesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const vouchers = vouchersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const publicData = publicSettingsDoc.exists ? publicSettingsDoc.data() : null;
    const maxVouchersPerOrder =
      publicData && typeof publicData.maxVouchersPerOrder === 'number'
        ? publicData.maxVouchersPerOrder
        : null;

    const settings = storefrontDoc.exists ? (storefrontDoc.data() as Record<string, unknown>) : null;

    const rawData: StorefrontData = {
      categories,
      vouchers,
      maxVouchersPerOrder,
      settings,
    };

    return JSON.parse(JSON.stringify(rawData));
  },
  ['storefront-data'],
  { revalidate: 600, tags: ['storefront'] }
);

export async function getStorefrontData(): Promise<StorefrontData | null> {
  if (!isAdminDbReady || !adminDb) {
    return {
      categories: [],
      vouchers: [],
      maxVouchersPerOrder: null,
      settings: null,
    };
  }
  try {
    return await cachedStorefront();
  } catch (err) {
    console.error('Failed to get storefront data:', err instanceof Error ? err.message : String(err));
    return null;
  }
}
