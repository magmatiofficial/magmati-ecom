/**
 * @file lib/orders/fetchCustomerOrderStats.ts
 * @description Shared client helper to fetch per-customer order statistics in chunks from the server API.
 */

import { authedFetchJson } from '@/lib/api/clientAuthFetch';

export interface CustomerOrderStat {
  orders: number;
  spent: number;
}

export async function fetchCustomerOrderStats(
  emails: string[]
): Promise<
  | { ok: true; stats: Record<string, CustomerOrderStat | null> }
  | { ok: false; error: string }
> {
  if (!Array.isArray(emails) || emails.length === 0) {
    return { ok: true, stats: {} };
  }

  const cleanedEmails = Array.from(
    new Set(
      emails
        .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
        .filter((e) => e.length > 0)
    )
  );

  if (cleanedEmails.length === 0) {
    return { ok: true, stats: {} };
  }

  const chunks: string[][] = [];
  for (let i = 0; i < cleanedEmails.length; i += 50) {
    chunks.push(cleanedEmails.slice(i, i + 50));
  }

  const mergedStats: Record<string, CustomerOrderStat | null> = {};

  for (const chunk of chunks) {
    const res = await authedFetchJson<{
      success?: boolean;
      stats?: Record<string, CustomerOrderStat | null>;
    }>('/api/admin/customers/order-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails: chunk }),
    });

    if (!res.ok || !res.data?.success || !res.data.stats || typeof res.data.stats !== 'object') {
      return {
        ok: false,
        error: 'Could not load customer order statistics. Please try again.',
      };
    }

    Object.assign(mergedStats, res.data.stats);
  }

  return {
    ok: true,
    stats: mergedStats,
  };
}
