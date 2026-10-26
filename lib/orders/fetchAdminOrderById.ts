/**
 * @file lib/orders/fetchAdminOrderById.ts
 * @description Shared client helper to fetch a single order by ID from the admin API.
 */

import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import type { Order } from '@/store/useOrderStore';

export type FetchAdminOrderByIdResult =
  | { ok: true; order: Order }
  | { ok: false; notFound?: boolean; error: string };

export async function fetchAdminOrderById(
  orderId: string
): Promise<FetchAdminOrderByIdResult> {
  if (!orderId || typeof orderId !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(orderId)) {
    return { ok: false, error: 'Invalid order id.' };
  }

  const res = await authedFetchJson<{
    success?: boolean;
    order?: Order;
    error?: string;
  }>(`/api/admin/orders/${encodeURIComponent(orderId)}`);

  if (res.status === 404) {
    return { ok: false, notFound: true, error: 'Order not found.' };
  }

  if (!res.ok || !res.data?.success || !res.data.order || !res.data.order.id) {
    return {
      ok: false,
      error: res.data?.error || 'Failed to load order.',
    };
  }

  return {
    ok: true,
    order: res.data.order,
  };
}
