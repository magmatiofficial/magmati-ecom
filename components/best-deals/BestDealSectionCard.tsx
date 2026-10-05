/**
 * @file components/best-deals/BestDealSectionCard.tsx
 * @description Master-crafted Best Deal Category Section:
 * - Top Header: Category Title, item count, and "See All" CTA
 * - Rich Spotlight Banner Strip: Bold headline, discount badge, guarantees, enlarged prominent category image,
 *   and a high-contrast crystal-clear CTA button.
 * - Spacious 4-Column Product Grid (2 on mobile, 3 on tablet, 4 on desktop)
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, ShieldCheck, Truck, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { BestDealSection } from '@/types/bestDeals';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface BestDealSectionCardProps {
  section: BestDealSection;
  allProducts: Product[];
  
}

export function BestDealSectionCard({
  section,
  allProducts,
  
}: BestDealSectionCardProps) {
  // Derive products for this section:
  const sectionProducts = useMemo(() => {
    // 1. Check if any products have been explicitly assigned to this section
    const assignedProducts = allProducts.filter((p) => p.bestDealSectionId === section.id);
    if (assignedProducts.length > 0) {
      return assignedProducts.slice(0, section.maxProducts || 8);
    }

    // 2. If explicit productIds are set on section
    if (section.productIds && section.productIds.length > 0) {
      const explicit = section.productIds
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      if (explicit.length > 0) return explicit.slice(0, section.maxProducts || 8);
    }

    // 3. Auto match based on category slug or keywords
    const categoryLower = section.categorySlug.toLowerCase();
    const keywords = section.keywords || [];

    const matched = allProducts.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subcategory || '').toLowerCase();
      const pName = (p.name || '').toLowerCase();

      if (pCat.includes(categoryLower) || pSub.includes(categoryLower)) {
        return true;
      }

      if (
        keywords.some(
          (k) =>
            pName.includes(k.toLowerCase()) ||
            pCat.includes(k.toLowerCase()) ||
            pSub.includes(k.toLowerCase())
        )
      ) {
        return true;
      }

      return false;
    });

    const limit = section.maxProducts || 8;
    if (matched.length >= limit) {
      return matched.slice(0, limit);
    }

    const matchedIds = new Set(matched.map((m) => m.id));
    const fallbackList = allProducts.filter((p) => !matchedIds.has(p.id));
    const combined = [...matched, ...fallbackList];
    return combined.slice(0, limit);
  }, [section, allProducts]);

  const displayTitle = section.titleEn;
  const bannerTag = section.banner.tagEn;
  const bannerHeading = section.banner.headingEn;
  const bannerSubheading = section.banner.subheadingEn;

  const targetLink = section.banner.link || section.seeMoreLink || `/shop?q=${encodeURIComponent(section.categorySlug)}`;

  return (
    <section
      id={section.id}
      className="bg-white rounded-3xl border border-border-color/90 p-4 sm:p-6 lg:p-7 shadow-xs space-y-5 transition-shadow hover:shadow-sm"
    >
      {/* 1. Header Row: Title on Left, See All Button on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border-color/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-2xs">
            <Flame className="w-5 h-5 fill-primary text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-text-main tracking-tight font-sans">
                {displayTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-text-muted text-2xs font-black font-mono">
                {sectionProducts.length}+ {'Items'}
              </span>
            </div>
            <p className="text-2xs sm:text-xs text-text-muted mt-0.5 font-medium">
              {'Curated price drops with 100% verified quality guarantee'}
            </p>
          </div>
        </div>

        <Link
          href={section.seeMoreLink || targetLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-subtle hover:bg-primary text-text-main hover:text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer group"
        >
          <span>{'View All Deals'}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 2. Enhanced Horizontal Category Spotlight Banner Strip */}
      <div 
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6 lg:p-7 text-white border border-border-dark shadow-md flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8"
        style={{
          backgroundColor: section.banner.bgColor || '#18181b',
        }}
      >
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Content Area */}
        <div className="relative z-10 space-y-2.5 max-w-xl text-center md:text-left flex-1">
          {/* Tag & Urgency */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {bannerTag && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-white text-2xs font-black uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                {bannerTag}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 text-amber-300 text-2xs font-black uppercase tracking-wider border border-white/15">
              <Sparkles className="w-3 h-3 text-brand-gold" />
              <span>{'LIMITED TIME SPOTLIGHT'}</span>
            </span>
          </div>

          {/* Heading */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            {bannerHeading}
          </h3>

          {/* Subheading */}
          {bannerSubheading && (
            <p className="text-xs sm:text-sm text-text-subtle/90 font-medium leading-relaxed max-w-lg">
              {bannerSubheading}
            </p>
          )}

          {/* Perks Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-2xs sm:text-xs text-text-subtle/90 font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {'100% Genuine'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              {'Fast Express Delivery'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              {'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* Right Side: Enlarged Prominent Image + High-Contrast Clear Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-4 shrink-0 w-full md:w-auto justify-center">
          {/* Enlarged Image Preview (Standard 4:3 / Square ratio) */}
          {section.banner.image ? (
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-40 rounded-2xl overflow-hidden bg-black/50 border-2 border-white/20 shadow-xl group/img">
              <Image
                src={section.banner.image}
                alt={bannerHeading}
                fill
                sizes="(max-width: 640px) 150px, 200px"
                className="object-cover group-hover/img:scale-108 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {bannerTag && (
                <div className="absolute bottom-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-amber-300 font-mono font-black text-2xs border border-white/20">
                    {bannerTag}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-zinc-300">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* High-Contrast Visible CTA Button */}
          <Link
            href={targetLink}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover !text-white font-black text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-primary/30 hover:scale-102 active:scale-95 group/btn cursor-pointer"
          >
            <span className="!text-white font-black drop-shadow-xs">
              {'Shop This Category'}
            </span>
            <ArrowRight className="w-4 h-4 !text-white transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* 3. Spacious 4-Column Product Grid (2 on mobile, 3 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {sectionProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
