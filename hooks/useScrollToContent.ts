'use client';

import { useEffect, useRef } from 'react';

/**
 * Returns a ref for a content area. Whenever `key` changes, the top of that area is scrolled
 * into view, but only if the top is currently above the visible screen. Nothing happens on the
 * first render, and nothing moves when the top of the content is already visible.
 * Put a "scroll-mt-*" class on the element so it is not hidden under a sticky header.
 */
export function useScrollToContent<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const element = ref.current;
    if (!element) return;
    if (element.getBoundingClientRect().top < 0) {
      element.scrollIntoView({ block: 'start' });
    }
  }, [key]);

  return ref;
}
