/**
 * @file hooks/useAdminReturnsBadge.ts
 * @description Hook to fetch and poll pending and approved return counts for the admin sidebar badge.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchReturnSummary } from '@/lib/returns/returnApi';

export interface AdminReturnsBadgeResult {
  openReturns: number | null;
  refresh: () => Promise<void>;
}

export function useAdminReturnsBadge(options?: {
  enabled?: boolean;
  pollIntervalMs?: number;
}): AdminReturnsBadgeResult {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 60000;

  const [openReturns, setOpenReturns] = useState<number | null>(null);
  const isFetchingRef = useRef(false);

  const fetchBadgeCounts = useCallback(async () => {
    if (!enabled || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const summary = await fetchReturnSummary();
      if (!summary || !summary.status) {
        return;
      }

      const pendingVal = summary.status.Pending;
      const approvedVal = summary.status.Approved;

      const hasPending = typeof pendingVal === 'number' && Number.isFinite(pendingVal);
      const hasApproved = typeof approvedVal === 'number' && Number.isFinite(approvedVal);

      if (hasPending && hasApproved) {
        setOpenReturns((pendingVal as number) + (approvedVal as number));
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
    openReturns,
    refresh: fetchBadgeCounts,
  };
}
