'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ResponsiveTableContainerProps {
  children: React.ReactNode;
  className?: string;
  showScrollCues?: boolean;
  /**
   * Distance in pixels from the bottom of the viewport so the bottom border and scrollbar are clearly visible
   * Default is 24px
   */
  offsetBottom?: number;
  /**
   * Minimum height in pixels
   * Default is 260px
   */
  minHeight?: number;
  /**
   * Optional maximum height cap in pixels
   */
  maxHeightCap?: number;
}

/**
 * ResponsiveTableContainer provides a clean, native table view with:
 * 1. Mouse Click & Drag horizontal scrolling
 * 2. Always visible bottom horizontal scrollbar
 * 3. Dynamic viewport height calculation
 */
export function ResponsiveTableContainer({
  children,
  className = '',
  offsetBottom = 24,
  minHeight = 260,
  maxHeightCap,
}: ResponsiveTableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  // Mouse click-and-drag scrolling state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const recalculateHeight = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const available = window.innerHeight - rect.top - offsetBottom;
    let height = Math.max(available, minHeight);
    if (maxHeightCap && height > maxHeightCap) {
      height = maxHeightCap;
    }
    setContainerHeight(Math.floor(height));
  }, [offsetBottom, minHeight, maxHeightCap]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    // Don't hijack drag on interactive elements inside table cells
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'BUTTON' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.tagName === 'A' ||
      targetEl.closest('button') ||
      targetEl.closest('a') ||
      targetEl.closest('input') ||
      targetEl.closest('select')
    ) {
      return;
    }

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Scroll speed factor
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  useEffect(() => {
    recalculateHeight();

    const handleResize = () => {
      recalculateHeight();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        recalculateHeight();
      });

      if (containerRef.current.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
      }
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [recalculateHeight]);

  return (
    <div className="relative w-full group/table-wrapper">
      {/* Clean Table Scroll Container with Visible Scrollbar and Mouse Drag Support */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          height: containerHeight ? `${containerHeight}px` : undefined,
          maxHeight: containerHeight ? `${containerHeight}px` : undefined,
        }}
        className={`overflow-auto border border-zinc-200 rounded-xl bg-white shadow-2xs w-full custom-table-scrollbar select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-default'
        } ${!containerHeight ? 'h-[calc(100vh-270px)] min-h-[260px]' : ''} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
