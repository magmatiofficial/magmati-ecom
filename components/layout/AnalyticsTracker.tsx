'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initVisitor = useAnalyticsStore((state) => state.initVisitor);
  const logPageView = useAnalyticsStore((state) => state.logPageView);
  const updatePageDuration = useAnalyticsStore((state) => state.updatePageDuration);

  const currentViewRef = useRef<{ id: string; startTime: number } | null>(null);

  useEffect(() => {
    initVisitor();
  }, [initVisitor]);

  useEffect(() => {
    // Record duration for the previous page view
    if (currentViewRef.current) {
      const duration = Math.round((Date.now() - currentViewRef.current.startTime) / 1000);
      updatePageDuration(currentViewRef.current.id, duration);
    }

    const fullPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Start tracking the new page view
    const logId = logPageView(fullPath);
    currentViewRef.current = { id: logId, startTime: Date.now() };

    return () => {
      // Ensure we record time if component unmounts
      if (currentViewRef.current) {
         const duration = Math.round((Date.now() - currentViewRef.current.startTime) / 1000);
         updatePageDuration(currentViewRef.current.id, duration);
      }
    };
  }, [pathname, searchParams, logPageView, updatePageDuration]);

  return null;
}
