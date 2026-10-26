'use client';

import { useEffect, useRef } from 'react';

/**
 * Scrolls the window to the top whenever `key` changes.
 * It does nothing on the first render, so the initial scroll position is never touched.
 */
export function useScrollToTop(key: unknown) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [key]);
}
