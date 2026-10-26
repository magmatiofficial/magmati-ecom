/**
 * @file hooks/useAdminUsersPage.ts
 * @description Reusable client hook for paginated admin users loading, filtering, searching, polling, and stats counting.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminUserView } from '@/lib/users/userFilters';
import { isUserRole } from '@/lib/users/userFilters';
import { fetchUserSummary, type UserCounts } from '@/lib/users/userApi';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';

export interface UseAdminUsersPageOptions {
  role: string;
  search: string;
  enabled?: boolean;
  pageSize?: number;
  pollIntervalMs?: number;
}

export function useAdminUsersPage({
  role,
  search,
  enabled = true,
  pageSize = 25,
  pollIntervalMs = 60000,
}: UseAdminUsersPageOptions) {
  const limit = Math.min(Math.max(1, pageSize), 50);
  const validRole = role && role !== 'All' && isUserRole(role) ? role : 'All';

  const [debouncedSearch, setDebouncedSearch] = useState((search || '').trim().slice(0, 60));
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((search || '').trim().slice(0, 60));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSeqRef = useRef(0);
  const initialCountsFetchedRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    if (!enabled) return;
    const c = await fetchUserSummary();
    if (c) {
      setCounts(c);
    }
  }, [enabled]);

  const fetchUsersPage = useCallback(
    async (cursor: string | null = null) => {
      if (!enabled) {
        setUsers([]);
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
      if (validRole !== 'All') {
        params.set('role', validRole);
      }
      if (debouncedSearch) {
        params.set('q', debouncedSearch);
      }
      if (cursor) {
        params.set('cursor', cursor);
      }

      const res = await authedFetchJson<{
        success?: boolean;
        users?: AdminUserView[];
        nextCursor?: string | null;
        hasMore?: boolean;
        error?: string;
      }>(`/api/admin/users?${params.toString()}`);

      if (seq !== requestSeqRef.current) return;

      setIsLoading(false);
      setIsLoadingMore(false);

      if (!res.ok || !res.data?.success || !Array.isArray(res.data.users)) {
        setError('Failed to load users.');
        if (!cursor) {
          setUsers([]);
          setHasMore(false);
          setNextCursor(null);
        }
        return;
      }

      const list = res.data.users;
      const nCursor = res.data.nextCursor ?? null;
      const more = Boolean(res.data.hasMore);

      if (cursor) {
        setUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
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
        setUsers(list);
      }

      setNextCursor(nCursor);
      setHasMore(more);
    },
    [enabled, limit, validRole, debouncedSearch]
  );

  // Fetch counts on first load when enabled
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

  // Fetch users page when enabled, role or search changes (does not fetch counts)
  useEffect(() => {
    void fetchUsersPage(null);
  }, [fetchUsersPage]);

  // Visible-tab poll for counts
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
    void fetchUsersPage(nextCursor);
  }, [hasMore, isLoadingMore, isLoading, nextCursor, fetchUsersPage]);

  const refresh = useCallback(() => {
    void refreshCounts();
    void fetchUsersPage(null);
  }, [refreshCounts, fetchUsersPage]);

  const patchUser = useCallback((id: string, patch: Partial<AdminUserView>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    users,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    refreshCounts,
    patchUser,
    removeUser,
  };
}
