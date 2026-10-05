/**
 * @file types/cart.ts
 * @description Shopping cart, wishlist, and checkout interfaces.
 */

import { Product, ProductColor } from './product';

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
  selected?: boolean;
  
  // Promotion metadata
  customPrice?: number;
  isFreeItem?: boolean;
  isComboItem?: boolean;
  claimedB1G1?: boolean;
  comboId?: string;
  promoLabel?: string;
  qualifyingProductId?: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface OrderItemSummary {
  productId: string;
  productName: string;
  size: string;
  colorName: string;
  price: number;
  quantity: number;
  image: string;
  
  // Promotion metadata
  promoType?: string;
  promoId?: string;
  promoLabel?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  paymentMethod: string;
  items: OrderItemSummary[];
}
