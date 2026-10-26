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

export type ProductType = 'simple' | 'variable' | 'digital';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type ProductBadge = 'new' | 'hot' | 'trending' | 'limited' | 'sale' | 'bestseller' | 'none';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'on_backorder';

export interface ProductVariation {
  id: string;
  variant_sku: string;
  variant_regular_price: number;
  variant_sale_price?: number;
  variant_stock_qty: number;
  variant_stock_status: StockStatus;
  variant_images: string[];
  variant_attributes: Record<string, string>;
  variant_weight?: number;
  variant_dimensions?: { l: number; w: number; h: number };
  variant_barcode?: string;
  variant_is_active: boolean;
  variant_is_default: boolean;
}

export interface ProductSpecification {
  spec_group: string;
  spec_key: string;
  spec_value: string;
}

export interface DownloadableFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
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
  tags?: string[];
  // New fields
  product_type?: ProductType;
  product_status?: ProductStatus;
  product_badge?: ProductBadge;
  short_description?: string;
  key_features?: string[];
  cost_price?: number;
  taxStatus?: 'taxable' | 'non_taxable' | 'shipping_only';
  taxClass?: string;
  costPrice?: number;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  pricePerUnitLabel?: string;
  weight?: number;
  weight_unit?: 'g' | 'kg';
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  dimension_unit?: 'cm' | 'inch';
  variations?: ProductVariation[];
  specifications?: ProductSpecification[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  related_product_ids?: string[];
  is_returnable?: boolean;
  return_window_days?: number;
  warranty_type?: 'manufacturer' | 'seller' | 'none';
  warranty_duration?: string;
  downloadable_files?: DownloadableFile[];
  download_limit?: number;
  download_expiry_days?: number;
  barcode_upc?: string;
  barcode_ean?: string;
  batch_number?: string;
  expiry_date?: string;
  model_number?: string;
  product_condition?: 'new' | 'used' | 'refurbished' | 'open_box';
}

export function isDigitalProduct(product: Product): boolean {
  return product.product_type === 'digital';
}

export function isVariableProduct(product: Product): boolean {
  return product.product_type === 'variable';
}

export function getEffectiveProductType(product: Product): ProductType {
  return product.product_type ?? 'simple';
}
