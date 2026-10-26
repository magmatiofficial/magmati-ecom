interface PricedItem {
  price: number;
  originalPrice?: number | null;
}

/** A discount exists only when the crossed-out price is higher than the selling price. */
export function hasDiscount(item: PricedItem): boolean {
  return typeof item.originalPrice === 'number' && item.originalPrice > item.price;
}

/** Discount percentage (0 when there is no discount). */
export function getDiscountPercent(item: PricedItem): number {
  if (!hasDiscount(item) || !item.originalPrice) return 0;
  return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
}
