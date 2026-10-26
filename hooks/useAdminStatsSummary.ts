/**
 * @file hooks/useAdminStatsSummary.ts
 * @description Hook to fetch and poll admin orders summary counts (including deliveredRevenue) and recent orders for the admin StatsTab.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import { fetchOrderSummary } from '@/lib/orders/fetchOrderSummary';
import type { OrderCounts } from '@/hooks/useAdminOrdersPage';
import type { Order } from '@/store/useOrderStore';

export interface AdminStatsSummaryResult {
  counts: (OrderCounts & { deliveredRevenue?: number | null }) | null;
  recentOrders: Order[] | null;
  refresh: () => Promise<void>;
}

export function useAdminStatsSummary(options?: {
  enabled?: boolean;
  pollIntervalMs?: number;
}): AdminStatsSummaryResult {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 60000;

  const [counts, setCounts] = useState<(OrderCounts & { deliveredRevenue?: number | null }) | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[] | null>(null);
  const isFetchingRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!enabled || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [summary, ordersRes] = await Promise.all([
        fetchOrderSummary(),
        authedFetchJson<{
          success?: boolean;
          orders?: Order[];
        }>('/api/admin/orders?limit=5'),
      ]);

      if (summary && typeof summary.total === 'number' && summary.status) {
        setCounts(summary);
      }

      if (ordersRes.ok && ordersRes.data?.success && Array.isArray(ordersRes.data.orders)) {
        setRecentOrders(ordersRes.data.orders);
      }
    } catch {
      // Keep previous values on failure, no error toast, no console output
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const guardedFetch = async () => {
      if (cancelled) return;
      await fetchStats();
    };

    guardedFetch();

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        guardedFetch();
      }
    }, pollIntervalMs);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        guardedFetch();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [enabled, pollIntervalMs, fetchStats]);

  return {
    counts,
    recentOrders,
    refresh: fetchStats,
  };
}
