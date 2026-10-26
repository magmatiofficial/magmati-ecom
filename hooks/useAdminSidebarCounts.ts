/**
 * @file useAdminSidebarCounts.ts
 * @description Hook to fetch and poll orders to dispatch, shipped orders count, total orders, and delivered revenue for the admin sidebar and notifications tab.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchOrderSummary } from '@/lib/orders/fetchOrderSummary';

export interface AdminSidebarCounts {
  ordersToDispatch: number | null;
  shippedOrders: number | null;
  totalOrders: number | null;
  deliveredRevenue: number | null;
  refresh: () => Promise<void>;
}

export function useAdminSidebarCounts(options?: {
  enabled?: boolean;
  pollIntervalMs?: number;
}): AdminSidebarCounts {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 60000;

  const [ordersToDispatch, setOrdersToDispatch] = useState<number | null>(null);
  const [shippedOrders, setShippedOrders] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [deliveredRevenue, setDeliveredRevenue] = useState<number | null>(null);
  const isFetchingRef = useRef(false);

  const fetchCounts = useCallback(async () => {
    if (!enabled || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const counts = await fetchOrderSummary();
      if (!counts) return;

      if (typeof counts.total === 'number' && Number.isFinite(counts.total)) {
        setTotalOrders(counts.total);
      }

      if (typeof counts.deliveredRevenue === 'number' && Number.isFinite(counts.deliveredRevenue)) {
        setDeliveredRevenue(counts.deliveredRevenue);
      }

      const status = counts.status;
      if (status) {
        const pendingVal = status.Pending;
        const processingVal = status.Processing;
        const shippedVal = status.Shipped;

        const hasPending = typeof pendingVal === 'number' && Number.isFinite(pendingVal);
        const hasProcessing = typeof processingVal === 'number' && Number.isFinite(processingVal);
        const hasShipped = typeof shippedVal === 'number' && Number.isFinite(shippedVal);

        if (hasPending || hasProcessing) {
          const p = hasPending ? (pendingVal as number) : 0;
          const pr = hasProcessing ? (processingVal as number) : 0;
          setOrdersToDispatch(p + pr);
        }

        if (hasShipped) {
          setShippedOrders(shippedVal as number);
        }
      }
    } catch {
      // Keep previous value on failure
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const guardedFetch = async () => {
      if (cancelled) return;
      await fetchCounts();
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
  }, [enabled, pollIntervalMs, fetchCounts]);

  return {
    ordersToDispatch,
    shippedOrders,
    totalOrders,
    deliveredRevenue,
    refresh: fetchCounts,
  };
}
