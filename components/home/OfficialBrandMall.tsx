'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';

interface BrandItem {
  id: string;
  name: string;
  logo: string;
  logoBg: string;
  category: 'all' | 'electronics' | 'fashion' | 'lifestyle' | 'grooming';
  categoryEn: string;
  discountEn: string;
  search: string;
}

const MASTER_BRANDS: BrandItem[] = [
  {
    id: 'brand-mi',
    name: 'Xiaomi',
    logo: 'MI',
    logoBg: 'bg-orange-600 text-white',
    category: 'electronics',
    categoryEn: 'Smart Gadgets & Audio',
    discountEn: 'Up to 35% OFF',
    search: 'Xiaomi',
  },
  {
    id: 'brand-anker',
    name: 'Anker',
    logo: 'ANKER',
    logoBg: 'bg-sky-500 text-white',
    category: 'electronics',
    categoryEn: 'Power & Fast Charging',
    discountEn: '18M Warranty',
    search: 'Anker',
  },
  {
    id: 'brand-baseus',
    name: 'Baseus',
    logo: 'BASEUS',
    logoBg: 'bg-amber-400 text-zinc-900 font-bold',
    category: 'electronics',
    categoryEn: 'Car & Mobile Accessories',
    discountEn: 'Up to 40% OFF',
    search: 'Baseus',
  },
  {
    id: 'brand-casio',
    name: 'Casio',
    logo: 'CASIO',
    logoBg: 'bg-blue-800 text-white',
    category: 'lifestyle',
    categoryEn: 'Authentic Timepieces',
    discountEn: '100% Original',
    search: 'Casio',
  },
  {
    id: 'brand-philips',
    name: 'Philips',
    logo: 'PHILIPS',
    logoBg: 'bg-blue-600 text-white',
    category: 'grooming',
    categoryEn: 'Trimmers & Grooming',
    discountEn: '2 Years Warranty',
    search: 'Philips',
  },
  {
    id: 'brand-magmati',
    name: 'MAGMATI',
    logo: 'MM',
    logoBg: 'bg-primary text-app-inverse font-serif',
    category: 'fashion',
    categoryEn: 'Festive & Premium Apparel',
    discountEn: 'New Festive Drop',
    search: 'Panjabi',
  },
  {
    id: 'brand-aarong',
    name: 'Aarong Handcraft',
    logo: 'AARONG',
    logoBg: 'bg-rose-900 text-white',
    category: 'fashion',
    categoryEn: 'Panjabi & Handloom',
    discountEn: 'Handcrafted',
    search: 'Panjabi',
  },
  {
    id: 'brand-apple',
    name: 'Apple',
    logo: 'APPLE',
    logoBg: 'bg-zinc-900 text-white',
    category: 'electronics',
    categoryEn: 'Smartwatches & Audio',
    discountEn: 'Official Stock',
    search: 'Watch',
  },
  {
    id: 'brand-apex',
    name: 'Apex Footwear',
    logo: 'APEX',
    logoBg: 'bg-primary text-white',
    category: 'lifestyle',
    categoryEn: 'Genuine Leather & Shoes',
    discountEn: 'Flat 20% OFF',
    search: 'Leather',
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    logo: 'SAMSUNG',
    logoBg: 'bg-blue-900 text-white',
    category: 'electronics',
    categoryEn: 'Accessories & Audio',
    discountEn: 'Genuine Guarantee',
    search: 'Samsung',
  },
  {
    id: 'brand-braun',
    name: 'Braun Grooming',
    logo: 'BRAUN',
    logoBg: 'bg-zinc-800 text-white',
    category: 'grooming',
    categoryEn: 'German Personal Care',
    discountEn: 'Official Import',
    search: 'Trimmer',
  },
  {
    id: 'brand-bata',
    name: 'Bata Heritage',
    logo: 'BATA',
    logoBg: 'bg-primary text-white font-sans',
    category: 'lifestyle',
    categoryEn: 'Casual & Formal Shoes',
    discountEn: 'Comfort Choice',
    search: 'Shoes',
  }
];

export function OfficialBrandMall() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  const categories: { id: string; nameEn: string }[] = [
    { id: 'all', nameEn: 'All Brands' },
    { id: 'electronics', nameEn: 'Electronics & Audio' },
    { id: 'clothing', nameEn: 'Fashion & Apparel' },
    { id: 'footwear', nameEn: 'Footwear & Sport' },
    { id: 'beauty', nameEn: 'Skincare & Cosmetics' },
    { id: 'accessories', nameEn: 'Accessories & Watches' },
  ];

  const filteredBrands = useMemo(() => {
    if (selectedCategory === 'all') return MASTER_BRANDS;
    return MASTER_BRANDS.filter((b) => b.category === selectedCategory);
  }, [selectedCategory]);

  // If not in expanded mode, show max 6 brands on mobile/desktop cleanly
  const displayedBrands = showAll ? filteredBrands : filteredBrands.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-zinc-900 rounded-2xl p-4 sm:p-5 text-white border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-sans text-white">
                {'Official Brands & Partners'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-2xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                100% Authentic
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {'Direct from certified brand distributors with brand warranty'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Link
            href="/shop"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>{'Browse All Products'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowAll(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
              }`}
            >
              {cat.nameEn}
            </button>
          );
        })}
      </div>

      {/* Brand Grid - Scalable and clean with limit */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-1">
        {displayedBrands.map((b) => (
          <Link
            key={b.id}
            href={`/shop?search=${encodeURIComponent(b.search)}`}
            className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 hover:border-primary hover:shadow-md transition-all group flex flex-col items-center text-center justify-between min-h-[175px]"
          >
            {/* Logo Avatar */}
            <div className={`w-13 h-13 rounded-2xl ${b.logoBg} flex items-center justify-center font-black text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform my-1`}>
              {b.logo}
            </div>

            <div className="my-1.5 w-full">
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-primary transition-colors leading-tight font-sans truncate">
                {b.name}
              </h3>
              <p className="text-2xs text-zinc-500 mt-0.5 truncate w-full">
                {b.categoryEn}
              </p>
            </div>

            {/* Offer / Warranty Tag */}
            <div className="pt-2 border-t border-zinc-100 w-full">
              <span className="text-2xs font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                {b.discountEn}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* View More / Show Less Button if more brands exist */}
      {filteredBrands.length > 6 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-xl bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {showAll
                ? ('Show Less')
                : (`View All ${filteredBrands.length} Brands`)}
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAll ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>
      )}
    </section>
  );
}

