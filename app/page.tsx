/**
 * @file app/page.tsx
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useProductStore } from '@/store/useProductStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { VoucherSection } from '@/components/home/VoucherSection';
import { FlashDeals } from '@/components/home/FlashDeals';
import { DailyDealsSection } from '@/components/home/DailyDealsSection';
import { BudgetDealsSection } from '@/components/home/BudgetDealsSection';
import { NewArrivals } from '@/components/home/NewArrivals';
import { OfficialBrandMall } from '@/components/home/OfficialBrandMall';
import { CustomerReviewsSection } from '@/components/home/CustomerReviewsSection';
import { AppDownloadStrip } from '@/components/home/AppDownloadStrip';
import { ComboProductsSection } from '@/components/home/ComboProductsSection';
import { Buy1Get1Section } from '@/components/home/Buy1Get1Section';

export default function HomePage() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();
  const siteSettings = useSiteSettingsStore();

  const isProductsLoading = !products || products.length === 0;
  const isCategoriesLoading = !categories || categories.length === 0;

  const flaggedTrending = (products || []).filter((p) => p.isTrending || p.isBestDeal);
  const trendingProducts = flaggedTrending.length > 0 ? flaggedTrending.slice(0, 8) : (products || []).slice(0, 8);

  // Default section order if siteSettings.sectionLayouts is empty
  const defaultLayouts = [
    { id: 'hero', name: 'Hero Banner Slider', enabled: true, preset: 'hero_slider' },
    { id: 'categories', name: 'Shop by Category', enabled: true, preset: 'cards' },
    { id: 'combo_products', name: 'Combo Products & Bundles', enabled: false, preset: 'cards' },
    { id: 'buy1_get1', name: 'Buy 1 Get 1 Free Offers', enabled: false, preset: 'cards' },
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

  const activeSections = (siteSettings.sectionLayouts && siteSettings.sectionLayouts.length > 0)
    ? siteSettings.sectionLayouts
    : defaultLayouts;

  const renderSection = (section: { id: string; enabled: boolean; customTitle?: string; customSubtitle?: string }) => {
    if (!section.enabled) return null;

    switch (section.id) {
      case 'hero':
        return <HeroBanner key="section-hero" />;

      case 'categories':
        return <FeaturedCategories key="section-categories" categories={categories} isLoading={isCategoriesLoading} />;

      case 'combo_products':
        return (
          <ComboProductsSection
            key="section-combo-products"
            title={section.customTitle}
            subtitle={section.customSubtitle}
          />
        );

      case 'buy1_get1':
        return (
          <Buy1Get1Section
            key="section-buy1-get1"
            title={section.customTitle}
            subtitle={section.customSubtitle}
          />
        );

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
            <div className="flex items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-zinc-200/90">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-2xs font-black uppercase tracking-wider text-primary">
                    {'TRENDING PICKS'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  {(section.customTitle) ||
                    ('Recommended For You')}
                </h2>
              </div>

              <Link
                href="/shop"
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-primary text-zinc-800 hover:text-white text-xs font-bold transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
              >
                <span>{'Browse All'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {isProductsLoading || trendingProducts.length === 0 ? (
              <div className="py-12 flex items-center justify-center col-span-full">
                <LoadingSpinner size="md" text={'Loading trending picks...'} />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
