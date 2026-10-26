/**
 * @file hooks/useAdminOrdersPage.ts
 * @description Reusable client hook for paginated admin orders loading, filtering, searching, polling, and stats counting.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Order } from '@/store/useOrderStore';
import { isOrderStatus, isPaymentStatus } from '@/lib/orders/orderFilters';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import { fetchOrderSummary } from '@/lib/orders/fetchOrderSummary';

export interface OrderCounts {
  total: number;
  status: {
    Pending: number;
    Processing: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
  };
  payment: {
    awaiting_verification: number;
    awaiting_gateway: number;
    paid: number;
    failed: number;
    cod_due: number;
  };
}

export interface UseAdminOrdersPageOptions {
  status: string;
  paymentStatus: string;
  search: string;
  enabled?: boolean;
  pageSize?: number;
  pollIntervalMs?: number;
}

export function useAdminOrdersPage({
  status,
  paymentStatus,
  search,
  enabled = true,
  pageSize = 25,
  pollIntervalMs = 30000,
}: UseAdminOrdersPageOptions) {
  const limit = Math.min(Math.max(1, pageSize), 50);

  // Validate status and paymentStatus
  const validStatus = status && status !== 'All' && isOrderStatus(status) ? status : 'All';
  const validPaymentStatus = paymentStatus && paymentStatus !== 'All' && isPaymentStatus(paymentStatus) ? paymentStatus : 'All';

  // Debounce search query (400ms)
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<OrderCounts | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newOrdersAvailable, setNewOrdersAvailable] = useState(false);

  const initialTotalRef = useRef<number | null>(null);
  const requestSeqRef = useRef(0);

  const fetchCounts = useCallback(async (): Promise<OrderCounts | null> => {
    if (!enabled) return null;
    return fetchOrderSummary();
  }, [enabled]);

  const handleCountsResult = useCallback((fetchedCounts: OrderCounts, isReset = false) => {
    setCounts(fetchedCounts);
    const fetchedTotal = fetchedCounts.total;
    if (isReset || initialTotalRef.current === null) {
      initialTotalRef.current = fetchedTotal;
      setNewOrdersAvailable(false);
    } else {
      if (fetchedTotal < initialTotalRef.current) {
        initialTotalRef.current = fetchedTotal;
      } else if (fetchedTotal > initialTotalRef.current) {
        setNewOrdersAvailable(true);
      }
    }
  }, []);

  const fetchOrdersAndCounts = useCallback(async (isRefresh = false, cursor: string | null = null) => {
    if (!enabled) return;

    const currentSeq = ++requestSeqRef.current;
    if (!cursor) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (validStatus !== 'All') params.set('status', validStatus);
      if (validPaymentStatus !== 'All') params.set('paymentStatus', validPaymentStatus);
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (cursor) params.set('cursor', cursor);

      // Fetch page data and counts in parallel (counts on first load / refresh)
      const requests: Promise<any>[] = [
        authedFetchJson<{ success: boolean; orders: Order[]; nextCursor: string | null; hasMore: boolean }>(
          `/api/admin/orders?${params.toString()}`
        ),
      ];

      if (isRefresh || initialTotalRef.current === null) {
        requests.push(fetchCounts());
      }

      const results = await Promise.all(requests);
      if (requestSeqRef.current !== currentSeq) return; // stale response

      const ordersRes = results[0];
      if (!ordersRes.ok || !ordersRes.data?.success) {
        throw new Error('Failed to load orders.');
      }

      const newOrders = ordersRes.data.orders || [];
      const newNextCursor = ordersRes.data.nextCursor || null;
      const newHasMore = Boolean(ordersRes.data.hasMore);

      if (!cursor) {
        setOrders(newOrders);
      } else {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const uniqueNew = newOrders.filter((o: Order) => !existingIds.has(o.id));
          return [...prev, ...uniqueNew];
        });
      }

      setNextCursor(newNextCursor);
      setHasMore(newHasMore);

      if (results[1]) {
        handleCountsResult(results[1], isRefresh);
      }
    } catch {
      if (requestSeqRef.current === currentSeq) {
        setError('Failed to load orders.');
      }
    } finally {
      if (requestSeqRef.current === currentSeq) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [enabled, limit, validStatus, validPaymentStatus, debouncedSearch, fetchCounts, handleCountsResult]);

  // Effect on filter/search change
  useEffect(() => {
    if (!enabled) {
      setOrders([]);
      setCounts(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      return;
    }
    fetchOrdersAndCounts(false, null);
  }, [enabled, validStatus, validPaymentStatus, debouncedSearch, fetchOrdersAndCounts]);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoading || isLoadingMore || !hasMore || !nextCursor) return;
    await fetchOrdersAndCounts(false, nextCursor);
  }, [enabled, isLoading, isLoadingMore, hasMore, nextCursor, fetchOrdersAndCounts]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setNewOrdersAvailable(false);
    await fetchOrdersAndCounts(true, null);
  }, [enabled, fetchOrdersAndCounts]);

  const refreshCounts = useCallback(async () => {
    if (!enabled) return;
    const countsData = await fetchCounts();
    if (countsData) {
      handleCountsResult(countsData, false);
    }
  }, [enabled, fetchCounts, handleCountsResult]);

  const patchOrder = useCallback((orderId: string, patch: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
    );
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  // Polling counts helper
  const pollCounts = useCallback(async () => {
    if (!enabled || typeof document === 'undefined' || document.visibilityState !== 'visible') return;
    const countsData = await fetchCounts();
    if (countsData) {
      handleCountsResult(countsData, false);
    }
  }, [enabled, fetchCounts, handleCountsResult]);

  // Polling timer
  useEffect(() => {
    if (!enabled || pollIntervalMs <= 0) return;
    const interval = setInterval(() => {
      pollCounts();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, pollIntervalMs, pollCounts]);

  return {
    orders,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    newOrdersAvailable,
    loadMore,
    refresh,
    refreshCounts,
    patchOrder,
    removeOrder,
  };
}
