/**
 * @file components/best-deals/BestDealsHeader.tsx
 * @description Master Breadcrumb and Interactive Quick Navigation Bar for Best Deals Page.
 * Features:
 * - Left and Right scroll control buttons with automatic visibility
 * - Mouse drag-to-scroll and touch-swipe enabled
 * - Active category highlight and smooth animated scrolling
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Home, Flame, Sparkles } from 'lucide-react';
import { BestDealSection } from '@/types/bestDeals';

interface BestDealsHeaderProps {
  sections: BestDealSection[];
  
  activeSectionId?: string;
}

export function BestDealsHeader({
  sections,
  
  activeSectionId,
}: BestDealsHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [sections]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  // Mouse drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    checkScrollability();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // account for sticky navigation header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{'Home'}</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-text-subtle" />
        <span className="font-bold text-text-main flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-primary fill-primary/20" />
          <span>{'Best Deals'}</span>
        </span>
      </nav>

      {/* 2. Top Banner / Page Intro */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-4 sm:p-6 text-white border border-border-dark shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-2xs sm:text-2xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            <span>{'Exclusive Megastore'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
            {'Best Deals Showcase'}
          </h1>
          <p className="text-2xs sm:text-xs text-text-subtle max-w-xl font-medium">
            {'Discover curated category showrooms with unbeatable discounts, guaranteed quality, and instant savings.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="relative z-10 flex items-center gap-2.5 self-start sm:self-auto bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-4 py-2.5 shadow-sm">
          <Flame className="w-4 h-4 text-primary animate-pulse" />
          <div className="text-left">
            <span className="block text-2xs text-text-subtle font-semibold uppercase tracking-wider">
              {'Active Categories'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {`${sections.length} Deal Zones`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sticky Interactive Category Scroll Bar with Navigation Controls */}
      <div className="sticky top-[58px] sm:top-[64px] z-30 bg-white/95 backdrop-blur-md py-2 sm:py-2.5 px-2 sm:px-3 rounded-2xl border border-border-color/90 shadow-sm">
        <div className="relative flex items-center gap-1.5">
          {/* Left Scroll Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`w-8 h-8 rounded-xl bg-surface-subtle hover:bg-border-color text-text-main flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs ${
              !canScrollLeft ? 'opacity-30 pointer-events-none' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-1 select-none cursor-grab active:cursor-grabbing overscroll-x-contain"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sections.map((section) => {
              const isActive = activeSectionId === section.id;
              const title = section.titleEn;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white font-black shadow-primary/20 scale-[1.02]'
                      : 'bg-surface-subtle hover:bg-border-color/80 text-text-main hover:text-text-main border border-border-color/70 hover:border-border-hover'
                  }`}
                >
                  <Flame className={`w-3 h-3 ${isActive ? 'text-white fill-white' : 'text-primary'}`} />
                  <span>{title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`w-8 h-8 rounded-xl bg-surface-subtle hover:bg-border-color text-text-main flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs ${
              !canScrollRight ? 'opacity-30 pointer-events-none' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
