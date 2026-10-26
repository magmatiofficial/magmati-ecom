/**
 * @file components/home/HomePageClient.tsx
 * @description High-end e-commerce homepage with clean bright promotional Hero Banner,
 * sleek compact horizontal category carousel, subtle redesigned Flash Sale section,
 * restored exclusive Voucher section, and curated trending product grid.
 * Adheres strictly to the MAGMATI brand palette (#D12929 deep red, #F2CB57 yellow, white).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { ProductCard } from '@/components/product/ProductCard';
import { PRODUCT_GRID_CLASS } from '@/components/product/ProductCardSlot';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { VoucherSection } from '@/components/home/VoucherSection';
import { FlashDeals } from '@/components/home/FlashDeals';
import { DailyDealsSection } from '@/components/home/DailyDealsSection';
import { BudgetDealsSection } from '@/components/home/BudgetDealsSection';
import { NewArrivals } from '@/components/home/NewArrivals';
import { OfficialBrandMall } from '@/components/home/OfficialBrandMall';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { AppDownloadStrip } from '@/components/home/AppDownloadStrip';
import { QuickDealsSection } from '@/components/home/QuickDealsSection';

export function HomePageClient() {
  const { products } = useProducts();
  const { categories, categoriesLoaded } = useCategories();
  const siteSettings = useSiteSettings();

  const isProductsLoading = !products || products.length === 0;

  const flaggedTrending = (products || []).filter((p) => p.isTrending || p.isBestDeal);
  const trendingProducts = flaggedTrending.length > 0 ? flaggedTrending.slice(0, 12) : (products || []).slice(0, 12);

  // Default section order if siteSettings.sectionLayouts is empty
  const defaultLayouts = [
    { id: 'hero', name: 'Hero Banner Slider', enabled: true, preset: 'hero_slider' },
    { id: 'categories', name: 'Shop by Category', enabled: true, preset: 'cards' },
    { id: 'flash_deals', name: 'Flash Deals Countdown', enabled: true, preset: 'timer_grid' },
    { id: 'daily_deals', name: 'Daily Deals Countdown', enabled: true, preset: 'timer_grid' },
    { id: 'budget_deals', name: 'Budget Deals Zone', enabled: true, preset: 'badge_grid' },
    { id: 'vouchers', name: 'Voucher & Coupon Hub', enabled: true, preset: 'ticket_grid' },
    { id: 'trending_picks', name: 'Trending & Recommended Picks', enabled: true, preset: 'tabbed_grid' },
    { id: 'new_arrivals', name: 'New Arrivals Catalog', enabled: true, preset: 'catalog_grid' },
    { id: 'brand_mall', name: 'Official Brand Mall', enabled: true, preset: 'pavilion_grid' },
    { id: 'reviews', name: 'Customer Reviews & Ratings', enabled: true, preset: 'testimonial_grid' },
    { id: 'app_download', name: 'Promo App & Welcome Banner', enabled: true, preset: 'bottom_strip' },
  ];

  const rawSections = (siteSettings.sectionLayouts && siteSettings.sectionLayouts.length > 0)
    ? siteSettings.sectionLayouts
    : defaultLayouts;

  const activeSections = (() => {
    if (rawSections.some((sec) => sec.id === 'quick_deals')) {
      return rawSections;
    }
    const copy = [...rawSections];
    const catIndex = copy.findIndex((sec) => sec.id === 'categories');
    const insertIndex = catIndex !== -1 ? catIndex + 1 : 1;
    copy.splice(insertIndex, 0, {
      id: 'quick_deals',
      name: 'Quick Deals (Tabs)',
      enabled: true,
      preset: 'tabbed_grid',
    });
    return copy;
  })();

  const renderSection = (section: { id: string; enabled: boolean; customTitle?: string; customSubtitle?: string }) => {
    if (!section.enabled) return null;

    switch (section.id) {
      case 'hero':
        return <HeroBanner key="section-hero" />;

      case 'categories':
        return <FeaturedCategories key="section-categories" categories={categories} isLoading={!categoriesLoaded} />;

      case 'quick_deals':
        return <QuickDealsSection key="section-quick-deals" title={section.customTitle} />;

      case 'vouchers':
        return <VoucherSection key="section-vouchers" />;

      case 'daily_deals':
        return (
          <DailyDealsSection
            key="section-daily-deals"
            products={products}
            isLoading={isProductsLoading}
            title={section.customTitle}
          />
        );

      case 'flash_deals':
        return (
          <FlashDeals
            key="section-flash-deals"
            products={products}
            isLoading={isProductsLoading}
            title={section.customTitle}
            subtitle={section.customSubtitle}
          />
        );

      case 'budget_deals':
        return <BudgetDealsSection key="section-budget-deals" />;

      case 'new_arrivals':
        return (
          <NewArrivals
            key="section-new-arrivals"
            products={products}
            isLoading={isProductsLoading}
            title={section.customTitle}
            subtitle={section.customSubtitle}
          />
        );

      case 'brand_mall':
        return <OfficialBrandMall key="section-brand-mall" />;

      case 'trending_picks':
        return (
          <section key={`section-${section.id}`} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
            <div className="flex flex-nowrap items-center justify-between gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-sans text-base sm:text-xl lg:text-2xl font-black tracking-tight text-text-main leading-tight">
                    {(section.customTitle) || ('Recommended For You')}
                  </h2>
                  <span className="hidden sm:block text-2xs font-bold text-text-muted uppercase tracking-wider truncate">
                    {'TRENDING PICKS'}
                  </span>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-2xs sm:text-xs font-bold text-text-main bg-surface hover:bg-surface-hover border border-border px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span>{'Browse All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isProductsLoading || trendingProducts.length === 0 ? (
              <div className="py-12 flex items-center justify-center col-span-full">
                <LoadingSpinner size="md" text={'Loading trending picks...'} />
              </div>
            ) : (
              <div className={PRODUCT_GRID_CLASS}>
                {trendingProducts.map((product, i) => {
                  let visibilityClass = "flex [&>*]:flex-1 [&>*]:min-w-0";
                  if (i === 6 || i === 7) visibilityClass = "hidden lg:flex [&>*]:flex-1 [&>*]:min-w-0";
                  else if (i === 8 || i === 9) visibilityClass = "hidden xl:flex [&>*]:flex-1 [&>*]:min-w-0";
                  else if (i === 10 || i === 11) visibilityClass = "hidden 2xl:flex [&>*]:flex-1 [&>*]:min-w-0";

                  return (
                    <div key={product.id} className={visibilityClass}>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );

      case 'reviews':
        return <CustomerReviewsSection key="section-reviews" />;

      case 'app_download':
        return <AppDownloadStrip key="section-app-download" />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-app-bg min-h-screen">
      {activeSections.map((sec) => renderSection(sec))}
    </div>
  );
}
