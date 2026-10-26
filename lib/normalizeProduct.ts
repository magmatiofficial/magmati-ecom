import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

/**
 * Normalizes a server product document by:
 * 1. Starting from the static product with the same id (from data/products.ts) if it exists.
 * 2. Applying Firestore document fields on top (server values win over static ones when they exist).
 * 3. Guaranteeing every required field of the Product type has a safe default:
 *    - rating 0, reviewCount 0
 *    - arrays [] for sizes/colors/images/tags (and details)
 *    - price 0
 *    - inStock true
 *    - stockQuantity 0 only if missing and no static value
 *    - strings '' (name, slug, category, subcategory, description, brand, sku)
 */
export function normalizeServerProduct(data: any, id: string): Product {
  const staticProduct = initialProducts.find((p) => p.id === id);

  const serverFields: Record<string, any> = {};
  if (data && typeof data === 'object') {
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        serverFields[key] = val;
      }
    }
  }

  const base: Record<string, any> = staticProduct ? { ...staticProduct, ...serverFields, id } : { ...serverFields, id };

  if (data && typeof data === 'object') {
    const optionalFields = ['originalPrice', 'discountPercent', 'previewGifUrl', 'videoUrl', 'media', 'bestDealSectionId'];
    for (const field of optionalFields) {
      if (!(field in serverFields)) {
        delete base[field];
      }
    }
  }

  const rating = typeof serverFields.rating === 'number'
    ? serverFields.rating
    : (typeof staticProduct?.rating === 'number' ? staticProduct.rating : 0);

  const reviewCount = typeof serverFields.reviewCount === 'number'
    ? serverFields.reviewCount
    : (typeof staticProduct?.reviewCount === 'number' ? staticProduct.reviewCount : 0);

  const price = typeof serverFields.price === 'number'
    ? serverFields.price
    : (typeof staticProduct?.price === 'number' ? staticProduct.price : 0);

  const inStock = typeof serverFields.inStock === 'boolean'
    ? serverFields.inStock
    : (typeof staticProduct?.inStock === 'boolean' ? staticProduct.inStock : true);

  const stockQuantity = typeof serverFields.stockQuantity === 'number'
    ? serverFields.stockQuantity
    : (typeof staticProduct?.stockQuantity === 'number' ? staticProduct.stockQuantity : 0);

  const sizes = Array.isArray(serverFields.sizes)
    ? serverFields.sizes
    : (Array.isArray(staticProduct?.sizes) ? staticProduct.sizes : []);

  const colors = Array.isArray(serverFields.colors)
    ? serverFields.colors
    : (Array.isArray(staticProduct?.colors) ? staticProduct.colors : []);

  const images = Array.isArray(serverFields.images)
    ? serverFields.images
    : (Array.isArray(staticProduct?.images) ? staticProduct.images : []);

  const tags = Array.isArray(serverFields.tags)
    ? serverFields.tags
    : (Array.isArray((staticProduct as any)?.tags) ? (staticProduct as any).tags : []);

  const details = Array.isArray(serverFields.details)
    ? serverFields.details
    : (Array.isArray(staticProduct?.details) ? staticProduct.details : []);

  const name = typeof serverFields.name === 'string'
    ? serverFields.name
    : (typeof staticProduct?.name === 'string' ? staticProduct.name : '');

  const slug = typeof serverFields.slug === 'string'
    ? serverFields.slug
    : (typeof staticProduct?.slug === 'string' ? staticProduct.slug : id);

  const category = typeof serverFields.category === 'string'
    ? serverFields.category
    : (typeof staticProduct?.category === 'string' ? staticProduct.category : '');

  const subcategory = typeof serverFields.subcategory === 'string'
    ? serverFields.subcategory
    : (typeof staticProduct?.subcategory === 'string' ? staticProduct.subcategory : '');

  const description = typeof serverFields.description === 'string'
    ? serverFields.description
    : (typeof staticProduct?.description === 'string' ? staticProduct.description : '');

  const brand = typeof serverFields.brand === 'string'
    ? serverFields.brand
    : (typeof staticProduct?.brand === 'string' ? staticProduct.brand : '');

  const sku = typeof serverFields.sku === 'string'
    ? serverFields.sku
    : (typeof staticProduct?.sku === 'string' ? staticProduct.sku : id);

  const finalOriginal = typeof base.originalPrice === 'number' ? base.originalPrice : 0;
  const derivedDiscountPercent = finalOriginal > price ? Math.round(((finalOriginal - price) / finalOriginal) * 100) : undefined;

  return {
    ...base,
    discountPercent: derivedDiscountPercent,
    id,
    name,
    slug,
    category,
    subcategory,
    price,
    rating,
    reviewCount,
    images,
    sizes,
    colors,
    tags,
    details,
    inStock,
    stockQuantity,
    description,
    brand,
    sku,
  } as unknown as Product;
}
