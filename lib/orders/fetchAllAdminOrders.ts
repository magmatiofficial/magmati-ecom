/**
 * @file lib/orders/fetchAllAdminOrders.ts
 * @description Shared helper to fetch all admin orders page by page from the server API for backup export.
 */

import type { Order } from '@/store/useOrderStore';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';

export async function fetchAllAdminOrders(): Promise<
  { ok: true; orders: Order[] } | { ok: false; error: string }
> {
  const orderMap = new Map<string, Order>();
  let cursor: string | null = null;
  let hasMore: boolean = true;
  let pages: number = 0;
  const MAX_PAGES = 100;

  while (hasMore) {
    pages++;
    if (pages > MAX_PAGES) {
      return {
        ok: false,
        error: 'Too many orders for an in-browser backup (limit 5000). A server-side export is required.',
      };
    }

    const url: string = `/api/admin/orders?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await authedFetchJson<{
      success: boolean;
      orders?: Order[];
      nextCursor?: string | null;
      hasMore?: boolean;
    }>(url);

    if (!res.ok || !res.data?.success || !Array.isArray(res.data.orders)) {
      return {
        ok: false,
        error: 'Could not load all orders for the backup. Please try again.',
      };
    }

    for (const order of res.data.orders) {
      if (order && order.id) {
        orderMap.set(order.id, order);
      }
    }

    hasMore = !!res.data.hasMore;
    cursor = res.data.nextCursor || null;

    if (hasMore && !cursor) {
      return { ok: false, error: 'Could not load all orders for the backup. Invalid pagination cursor.' };
    }
    if (!hasMore) {
      break;
    }
  }

  const orders = Array.from(orderMap.values()).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return {
    ok: true,
    orders,
  };
}
