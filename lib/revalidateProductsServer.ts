import { revalidateTag } from 'next/cache';

/** Server-side: refresh the cached products list. Never throws. */
export function revalidateProductsServer(): void {
  try {
    revalidateTag('products');
  } catch (e) {
    console.warn('revalidateProductsServer notice:', e);
  }
}
