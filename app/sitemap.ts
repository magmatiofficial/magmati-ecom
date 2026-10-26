import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';

  // Base routes
  const routes = ['', '/shop', '/category', '/deals', '/flash-deals', '/best-deals', '/track', '/cart', '/account'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    })
  );

  if (!adminDb) {
    return routes;
  }

  try {
    const snapshot = await adminDb.collection('products').get();
    const productRoutes: MetadataRoute.Sitemap = snapshot.docs.map((doc) => ({
      url: `${baseUrl}/product/${doc.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    const rawCategories = snapshot.docs
      .map((doc) => doc.data()?.category)
      .filter((cat): cat is string => typeof cat === 'string' && cat.trim().length > 0);
    const categories = Array.from(new Set(rawCategories));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/shop?category=${encodeURIComponent(cat)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...routes, ...productRoutes, ...categoryRoutes];
  } catch {
    return routes;
  }
}

