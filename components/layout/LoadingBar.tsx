'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ProgressBarHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Whenever pathname or searchParams changes, complete and hide the progress bar
    setProgress(100);
    const fadeTimer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(fadeTimer);
  }, [pathname, searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Intercept only relative internal links that don't open in a new tab
      if (href && href.startsWith('/') && !href.startsWith('//') && target !== '_blank') {
        const currentUrl = window.location.pathname + window.location.search;
        // Only trigger if we are actually navigating to a different page/search
        if (href !== currentUrl && href !== pathname) {
          setVisible(true);
          setProgress(25);

          // Animate progress smoothly
          clearInterval(timer);
          timer = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 90) {
                clearInterval(timer);
                return 90;
              }
              return prev + (90 - prev) * 0.2;
            });
          }, 80);
        }
      }
    };

    const handleStartEvent = () => {
      setVisible(true);
      setProgress(30);
      clearInterval(timer);
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + (90 - prev) * 0.2));
      }, 80);
    };

    const handleDoneEvent = () => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('app-route-loading-start', handleStartEvent);
    window.addEventListener('app-route-loading-end', handleDoneEvent);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('app-route-loading-start', handleStartEvent);
      window.removeEventListener('app-route-loading-end', handleDoneEvent);
      clearInterval(timer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-primary/15 overflow-hidden pointer-events-none">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out shadow-[0_0_12px_var(--color-primary),0_0_6px_var(--color-primary)] relative"
        style={{ width: `${progress}%` }}
      >
        {/* Glow head */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/40 shadow-sm" />
      </div>
    </div>
  );
}

export function LoadingBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarHandler />
    </Suspense>
  );
}
