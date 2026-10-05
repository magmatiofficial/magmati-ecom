/**
 * @file types/product.ts
 * @description Product models, rich media structures, and related data structures.
 */

export type ProductMediaType = 'image' | 'gif' | 'video';

export interface ProductMediaItem {
  id: string;
  type: ProductMediaType;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  videoSource?: 'upload' | 'youtube' | 'vimeo' | 'direct';
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  price: number; // In BDT (৳)
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  image?: string;
  media?: ProductMediaItem[];
  previewGifUrl?: string; // Optional dedicated hover preview GIF
  videoUrl?: string; // Quick reference video link
  sizes: string[];
  colors?: ProductColor[];
  inStock: boolean;
  stockQuantity?: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestDeal?: boolean;
  isFlashDeal?: boolean;
  isBrandMall?: boolean;
  flashDealEnds?: string; // ISO date string
  description: string;
  details: string[];
  brand: string;
  sku: string;
  lowStockThreshold?: number;
  showDiscountBadge?: boolean;
  showFlashBadge?: boolean;
  showTrendingBadge?: boolean;
  showMallBadge?: boolean;
  showHotDealBadge?: boolean;
  showNewBadge?: boolean;
  allowedPaymentMethods?: ('cod' | 'bkash' | 'nagad' | 'card')[];
  bestDealSectionId?: string; // Links product directly to a specific Best Deals section
}
