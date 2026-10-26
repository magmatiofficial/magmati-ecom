/**
 * @file lib/returns/returnItemDisplay.ts
 * @description Pure helper functions to extract display name and image from a return item with fallback to nested product structure.
 */

/**
 * Returns the first non-empty trimmed string among item.name and item.product.name, or ''.
 */
export function getReturnItemName(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return '';
  }

  const rec = item as Record<string, unknown>;

  if (typeof rec.name === 'string' && rec.name.trim().length > 0) {
    return rec.name.trim();
  }

  if (rec.product && typeof rec.product === 'object') {
    const prod = rec.product as Record<string, unknown>;
    if (typeof prod.name === 'string' && prod.name.trim().length > 0) {
      return prod.name.trim();
    }
  }

  return '';
}

/**
 * Returns the first non-empty trimmed string among item.image and item.product.image, or undefined.
 */
export function getReturnItemImage(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') {
    return undefined;
  }

  const rec = item as Record<string, unknown>;

  if (typeof rec.image === 'string' && rec.image.trim().length > 0) {
    return rec.image.trim();
  }

  if (rec.product && typeof rec.product === 'object') {
    const prod = rec.product as Record<string, unknown>;
    if (typeof prod.image === 'string' && prod.image.trim().length > 0) {
      return prod.image.trim();
    }
  }

  return undefined;
}
