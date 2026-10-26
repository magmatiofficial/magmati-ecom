/**
 * @file lib/orders/fetchOrderSummary.ts
 * @description Shared helper to fetch order summary counts for admin dashboards.
 */

import type { OrderCounts } from '@/hooks/useAdminOrdersPage';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';

export type OrderSummaryCounts = OrderCounts & { deliveredRevenue?: number | null };

let inFlight: Promise<OrderSummaryCounts | null> | null = null;

export async function fetchOrderSummary(): Promise<OrderSummaryCounts | null> {
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const res = await authedFetchJson<{ success?: boolean; counts?: OrderSummaryCounts }>('/api/admin/orders/summary');
      if (res.ok && res.data?.success && res.data.counts) {
        return res.data.counts;
      }
      return null;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
