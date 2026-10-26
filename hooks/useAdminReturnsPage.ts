/**
 * @file hooks/useAdminReturnsPage.ts
 * @description Reusable client hook for paginated admin return requests loading, filtering, searching, polling, and stats counting.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { isReturnStatus } from '@/lib/returns/returnFilters';
import { fetchReturnSummary, ReturnCounts } from '@/lib/returns/returnApi';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';

export interface UseAdminReturnsPageOptions {
  status: string;
  search: string;
  enabled?: boolean;
  pageSize?: number;
  pollIntervalMs?: number;
}

export function useAdminReturnsPage({
  status,
  search,
  enabled = true,
  pageSize = 25,
  pollIntervalMs = 60000,
}: UseAdminReturnsPageOptions) {
  const limit = Math.min(Math.max(1, pageSize), 50);

  const validStatus = status && status !== 'All' && isReturnStatus(status) ? status : 'All';

  const [debouncedSearch, setDebouncedSearch] = useState(search.trim().slice(0, 40));
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().slice(0, 40));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [counts, setCounts] = useState<ReturnCounts | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSeqRef = useRef(0);
  const initialCountsFetchedRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    if (!enabled) return;
    const c = await fetchReturnSummary();
    if (c) {
      setCounts(c);
    }
  }, [enabled]);

  const fetchReturnsPage = useCallback(
    async (cursor: string | null = null) => {
      if (!enabled) {
        setReturns([]);
        setHasMore(false);
        setNextCursor(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        setError(null);
        return;
      }

      const seq = ++requestSeqRef.current;
      if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (validStatus !== 'All') {
        params.set('status', validStatus);
      }
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      }
      if (cursor) {
        params.set('cursor', cursor);
      }

      const res = await authedFetchJson<{
        success?: boolean;
        returns?: ReturnRequest[];
        nextCursor?: string | null;
        hasMore?: boolean;
        error?: string;
      }>(`/api/admin/returns?${params.toString()}`);

      if (seq !== requestSeqRef.current) return;

      setIsLoading(false);
      setIsLoadingMore(false);

      if (!res.ok || !res.data?.success || !Array.isArray(res.data.returns)) {
        setError('Failed to load returns.');
        if (!cursor) {
          setReturns([]);
          setHasMore(false);
          setNextCursor(null);
        }
        return;
      }

      const list = res.data.returns;
      const nCursor = res.data.nextCursor ?? null;
      const more = Boolean(res.data.hasMore);

      if (cursor) {
        setReturns((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const item of list) {
            if (item && item.id && !existingIds.has(item.id)) {
              existingIds.add(item.id);
              merged.push(item);
            }
          }
          return merged;
        });
      } else {
        setReturns(list);
      }

      setNextCursor(nCursor);
      setHasMore(more);
    },
    [enabled, limit, validStatus, debouncedSearch]
  );

  useEffect(() => {
    if (!enabled) {
      initialCountsFetchedRef.current = false;
      setCounts(null);
      return;
    }
    if (!initialCountsFetchedRef.current) {
      initialCountsFetchedRef.current = true;
      void refreshCounts();
    }
  }, [enabled, refreshCounts]);

  useEffect(() => {
    void fetchReturnsPage(null);
  }, [fetchReturnsPage]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshCounts();
      }
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, pollIntervalMs, refreshCounts]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading || !nextCursor) return;
    void fetchReturnsPage(nextCursor);
  }, [hasMore, isLoadingMore, isLoading, nextCursor, fetchReturnsPage]);

  const refresh = useCallback(() => {
    void refreshCounts();
    void fetchReturnsPage(null);
  }, [refreshCounts, fetchReturnsPage]);

  const patchReturn = useCallback((id: string, patch: Partial<ReturnRequest>) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }, []);

  const removeReturn = useCallback((id: string) => {
    setReturns((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    returns,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    refreshCounts,
    patchReturn,
    removeReturn,
  };
}
