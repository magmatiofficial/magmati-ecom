import { MetadataRoute } from 'next';
import { products } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Dynamic Product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Unique Categories
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(cat)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
