/**
 * @file hooks/useAdminCustomerOrderStats.ts
 * @description Hook to fetch per-customer order stats in batches with debouncing and memoization.
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { CustomerOrderStat, fetchCustomerOrderStats } from '@/lib/orders/fetchCustomerOrderStats';

export function useAdminCustomerOrderStats(
  emails: string[]
): { stats: Record<string, CustomerOrderStat | null> } {
  const [stats, setStats] = useState<Record<string, CustomerOrderStat | null>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  const normalizedKey = useMemo(() => {
    if (!Array.isArray(emails)) return '';
    const clean = Array.from(
      new Set(
        emails
          .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
          .filter((e) => e.length > 0)
      )
    ).sort();
    return clean.join(',');
  }, [emails]);

  useEffect(() => {
    if (!normalizedKey) return;

    let cancelled = false;
    const emailList = normalizedKey.split(',').filter(Boolean);
    const unrequested = emailList.filter((e) => !requestedRef.current.has(e));

    if (unrequested.length === 0) return;

    const timer = setTimeout(async () => {
      const result = await fetchCustomerOrderStats(unrequested);
      if (cancelled) return;

      if (result.ok && result.stats) {
        for (const e of unrequested) {
          requestedRef.current.add(e);
        }
        setStats((prev) => ({ ...prev, ...result.stats }));
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalizedKey]);

  return { stats };
}
