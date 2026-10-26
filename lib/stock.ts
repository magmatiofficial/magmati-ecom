interface StockInfo {
  inStock?: boolean;
  stockQuantity?: number;
}

/**
 * Returns how many units can be bought, or null when no limit is set.
 * A product marked inStock === false always has 0 available.
 */
export function getStockLimit(product: StockInfo): number | null {
  if (product.inStock === false) return 0;
  if (typeof product.stockQuantity === 'number') return Math.max(0, product.stockQuantity);
  return null;
}

/** True when at least `quantity` units can be bought. */
export function isInStock(product: StockInfo, quantity = 1): boolean {
  const limit = getStockLimit(product);
  return limit === null || limit >= quantity;
}
