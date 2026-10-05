/**
 * @file components/home/DailyDealsSpotlight.tsx
 * @description High-conversion Deal of the Day & Promotional Spotlight Hub.
 * Features:
 * - Featured Star Product with live stock urgency, countdown clock, and instant cart integration
 * - Promotional Banners: Buy 1 Get 1 / Bundle deals, Nationwide Free Shipping, and Super Clearance Drop
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, 
  Flame, 
  Clock, 
  Star, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  Gift, 
  ArrowRight,
  Sparkles,
  Percent
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { formatBDT } from '@/lib/formatCurrency';

export function DailyDealsSpotlight() {
  const { products } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);

  const [added, setAdded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 9, minutes: 24, seconds: 48 });

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => String(n).padStart(2, '0');

  // Featured Deal of the Day Product
  const featuredProduct = React.useMemo(() => {
    return (
      products.find((p) => p.id === 'elec-ultra-watch-pro') ||
      products.find((p) => p.isFlashDeal || p.isBestDeal) ||
      products[0]
    );
  }, [products]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!featuredProduct) return;
    addItem(featuredProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!featuredProduct) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-2 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-black uppercase tracking-wider mb-1.5">
            <Zap className="w-3.5 h-3.5 fill-primary" />
            <span>{'MEGA PROMOTIONS & DEALS'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 font-sans tracking-tight">
            {'Deal of the Day & Exclusive Promos'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            {'Grab highest discounts, bundle gifts, and free delivery offers before time runs out.'}
          </p>
        </div>

        <Link
          href="/best-deals"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>{'View All Best Deals'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </div>

      {/* Main Showcase Layout: Left Featured Product + Right 3 Promo Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* LEFT: Featured Deal of the Day (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          {/* Top Badge & Timer Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-primary text-app-inverse text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                {'DEAL OF THE DAY'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-eyebrow font-bold">
                {'28% OFF TODAY'}
              </span>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 bg-zinc-950 text-white px-3 py-1 rounded-xl text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatNum(timeLeft.hours)}:{formatNum(timeLeft.minutes)}:{formatNum(timeLeft.seconds)}</span>
            </div>
          </div>

          {/* Product Media & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-5 items-center">
            {/* Image Preview Stage */}
            <Link href={`/product/${featuredProduct.id}`} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 group block">
              <Image
                src={featuredProduct.images[0]}
                alt={featuredProduct.name}
                fill
                sizes="(max-width: 640px) 100vw, 350px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-primary text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                -28%
              </div>
            </Link>

            {/* Content & Urgency Info */}
            <div className="flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{featuredProduct.rating}</span>
                  <span className="text-zinc-400 font-normal">({featuredProduct.reviewCount}+ {'reviews'})</span>
                </div>

                <Link href={`/product/${featuredProduct.id}`}>
                  <h3 className="text-lg sm:text-xl font-black text-zinc-900 hover:text-primary transition-colors leading-snug font-sans">
                    {featuredProduct.name}
                  </h3>
                </Link>

                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {featuredProduct.description}
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                  {formatBDT(featuredProduct.price)}
                </span>
                {featuredProduct.originalPrice && (
                  <span className="text-sm font-medium text-zinc-400 line-through font-mono">
                    {formatBDT(featuredProduct.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Progress Bar */}
              <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                <div className="flex items-center justify-between text-eyebrow font-bold text-zinc-700 mb-1">
                  <span className="flex items-center gap-1 text-primary">
                    <Flame className="w-3 h-3 fill-primary" />
                    {'Almost Sold Out!'}
                  </span>
                  <span className="text-zinc-500 font-mono">{'Only 5 left'}</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-primary h-full rounded-full w-[82%]" />
                </div>
              </div>

              {/* Quick Perks */}
              <div className="flex items-center gap-3 text-eyebrow text-zinc-600 font-medium">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  {'Fast Delivery'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  {'Warranty'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-app-inverse'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{'Added to Bag'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{'Add to Bag'}</span>
                </>
              )}
            </button>

            <Link
              href={`/product/${featuredProduct.id}`}
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{'Buy Now'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>

        {/* RIGHT: 3 Strategic Promotional Tiles (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Promo Card 1: Bundle & Save Gift Promo */}
          <Link
            href="/best-deals"
            className="group bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[65%]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-black text-2xs uppercase tracking-wider mb-1.5">
                <Gift className="w-3 h-3" />
                {'BUNDLE & SAVE'}
              </span>
              <h4 className="text-base font-black text-zinc-900 group-hover:text-amber-700 transition-colors leading-snug">
                {'Buy 1 Get Free Gift Bundle'}
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-snug">
                {'Curated seasonal gift bundles with free straps & boxes'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-2">
                {'Claim Offer'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-amber-100 shrink-0 border border-amber-200 shadow-2xs">
              <Image
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80"
                alt="Combo Deals"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="96px"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

          {/* Promo Card 2: Free Delivery Nationwide Promo */}
          <Link
            href="/shop"
            className="group bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[65%]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-2xs uppercase tracking-wider mb-1.5">
                <Truck className="w-3 h-3" />
                {'FREE SHIPPING'}
              </span>
              <h4 className="text-base font-black text-zinc-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {'Free Nationwide Delivery on ৳999+'}
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-snug">
                {'Fast door-to-door express delivery with cash on delivery'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-2">
                {'Shop Free Delivery'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-emerald-100 shrink-0 border border-emerald-200 shadow-2xs">
              <Image
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80"
                alt="Free Delivery"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="96px"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

          {/* Promo Card 3: Clearance Mega Discount Drop */}
          <Link
            href="/best-deals"
            className="group bg-gradient-to-r from-purple-500/15 via-primary/10 to-transparent bg-white rounded-3xl p-4 sm:p-5 border border-purple-200/80 hover:border-purple-400 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden relative"
          >
            <div className="relative z-10 max-w-[65%]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600 text-white font-black text-2xs uppercase tracking-wider mb-1.5">
                <Percent className="w-3 h-3" />
                {'UP TO 50% OFF'}
              </span>
              <h4 className="text-base font-black text-zinc-900 group-hover:text-purple-700 transition-colors leading-snug">
                {'Clearance & Limited Stock Mega Sale'}
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-snug">
                {'Grab trending high-demand items before stock sells out'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 mt-2">
                {'Explore Clearance'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200 shadow-2xs">
              <Image
                src="https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=300&q=80"
                alt="Clearance Deals"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="96px"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
