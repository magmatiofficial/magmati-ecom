'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { ComboProductsSection } from '@/components/home/ComboProductsSection';
import { Buy1Get1Section } from '@/components/home/Buy1Get1Section';
import { QuickDealsProductRowSkeleton } from '@/components/skeletons/QuickDealsProductRowSkeleton';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { Product } from '@/types';
import { PRODUCT_CARD_SLOT_CLASS } from '@/components/product/ProductCardSlot';

export function QuickDealsSection({ title }: { title?: string }) {
  const { quickDeals, combos, b1g1Offers } = useSiteSettings();
  const { products } = useProducts();
  const { settingsLoaded } = useSyncStatusStore();
  const rowRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startScroll: 0, moved: false });
  const [tabsOverflow, setTabsOverflow] = useState(false);

  const safeTitle = title || quickDeals?.title || 'Quick Deal';
  const tabs = useMemo(() => {
    return (quickDeals?.tabs || []).filter((tab) => tab.enabled);
  }, [quickDeals?.tabs]);

  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  // If the active id no longer exists use the first
  const currentTab = tabs.find((t) => t.id === selectedTabId) ?? tabs[0];

  const currentTabType = currentTab
    ? (currentTab.type ?? (currentTab.id === 'b1g1' ? 'b1g1' : currentTab.id === 'combo' ? 'combos' : 'products'))
    : 'products';

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    (products || []).forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [products]);

  const tabProducts = useMemo(() => {
    if (!currentTab?.productIds) return [];
    return currentTab.productIds
      .map((id) => productMap.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [currentTab, productMap]);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const width = rowRef.current.clientWidth;
    const scrollAmount = width * 0.8;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const isProductsLoading = !products || products.length === 0;

  const isCurrentTabEmpty =
    currentTabType === 'combos'
      ? !combos || combos.length === 0
      : currentTabType === 'b1g1'
      ? !b1g1Offers || b1g1Offers.length === 0
      : tabProducts.length === 0;

  const showSkeleton =
    (!settingsLoaded && isCurrentTabEmpty) ||
    (currentTabType === 'products' && isProductsLoading);

  useEffect(() => {
    const check = () => {
      const el = tabsRef.current;
      setTabsOverflow(!!el && el.scrollWidth > el.clientWidth + 1);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [tabs.length]);

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const handleTabsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsRef.current;
    if (!el || e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragRef.current.startX;
      if (Math.abs(dx) > 5) dragRef.current.moved = true;
      el.scrollLeft = dragRef.current.startScroll - dx;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 font-sans">
      <div className="rounded-2xl overflow-hidden border-2 border-primary/20 bg-white shadow-lg">
        {/* Panel header bar */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color bg-white">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-text-main whitespace-nowrap">{safeTitle}</h2>
            </div>
          </div>

          {/* Segmented Pill Tab bar */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl min-w-0 max-w-full">
            {tabsOverflow && (
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                aria-label="Scroll tabs left"
                className="hidden md:flex shrink-0 w-7 h-7 items-center justify-center rounded-lg bg-white text-zinc-700 hover:text-zinc-900 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div
              ref={tabsRef}
              onMouseDown={handleTabsMouseDown}
              className="flex-1 min-w-0 cursor-grab active:cursor-grabbing select-none flex gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === currentTab?.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (dragRef.current.moved) return;
                      setSelectedTabId(tab.id);
                    }}
                    className={`relative shrink-0 whitespace-nowrap px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {tabsOverflow && (
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                aria-label="Scroll tabs right"
                className="hidden md:flex shrink-0 w-7 h-7 items-center justify-center rounded-lg bg-white text-zinc-700 hover:text-zinc-900 transition-colors shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab body */}
        {showSkeleton ? (
          <div className="p-4 bg-white/40">
            <QuickDealsProductRowSkeleton />
          </div>
        ) : currentTabType === 'combos' ? (
          <div className="p-3 sm:p-4 bg-white/40">
            <ComboProductsSection embedded />
          </div>
        ) : currentTabType === 'b1g1' ? (
          <div className="p-3 sm:p-4 bg-white/40">
            <Buy1Get1Section embedded />
          </div>
        ) : tabProducts.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500 bg-white/40">
            No products available in this tab yet
          </div>
        ) : (
          <div className="relative p-3 sm:p-5 bg-white/40">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer border border-zinc-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={rowRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x scroll-pl-3 sm:scroll-pl-4 scroll-pr-3 sm:scroll-pr-4 pb-2 pt-1 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabProducts.map((p) => (
                <div
                  key={p.id}
                  className={`${PRODUCT_CARD_SLOT_CLASS} bg-white rounded-card border border-border-color/60 shadow-xs hover:shadow-md transition-all overflow-hidden`}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-md hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer border border-zinc-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
