/**
 * @file hooks/useAdminUsersBadge.ts
 * @description Hook to fetch and poll user counts for the admin sidebar badge.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchUserSummary, type UserCounts } from '@/lib/users/userApi';

export interface UseAdminUsersBadgeOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
}

export interface AdminUsersBadgeResult {
  totalUsers: number | null;
  counts: UserCounts | null;
  refresh: () => Promise<void>;
}

export function useAdminUsersBadge(options?: UseAdminUsersBadgeOptions): AdminUsersBadgeResult {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 60000;

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const isFetchingRef = useRef(false);

  const fetchBadgeCounts = useCallback(async () => {
    if (!enabled || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const summary = await fetchUserSummary();
      if (!summary) {
        return;
      }

      setCounts(summary);
      if (typeof summary.total === 'number' && Number.isFinite(summary.total)) {
        setTotalUsers(summary.total);
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
      await fetchBadgeCounts();
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
  }, [enabled, pollIntervalMs, fetchBadgeCounts]);

  return {
    totalUsers,
    counts,
    refresh: fetchBadgeCounts,
  };
}
