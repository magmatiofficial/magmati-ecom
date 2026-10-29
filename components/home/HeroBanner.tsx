/**
 * @file components/home/HeroBanner.tsx
 * @description Ultra-premium, aesthetically stunning campaign Hero Banner.
 * Features:
 * - Unobstructed background imagery: No heavy blocking badges covering models/products.
 * - Minimal, high-impact glassmorphic badges and crisp typography.
 * - Perfectly balanced single-screen layout across Mobile, Tablet, and Desktop.
 * - MAGMATI brand palette: Deep Red (#D12929), Brand Gold (#F2CB57), and Dark Luxury (#141414).
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  ShoppingBag
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    badge: 'MEGA TECH SALE',
    discount: 'UP TO 60% OFF',
    title: 'Smart Tech & Gadgets',
    subtitle: 'Original smartwatches, earbuds & gear with warranty',
    buttonText: 'Shop Now',
    buttonLink: '/shop?category=Electronics+%26+Gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop&q=85',
  },
  {
    id: 'slide-2',
    badge: 'FESTIVE COLLECTION',
    discount: 'FLAT 40% OFF',
    title: 'Royal Festive Attires',
    subtitle: 'Designer Panjabis, Jamdanis & luxury festive wear',
    buttonText: 'Shop Fashion',
    buttonLink: '/shop?category=Men%27s+Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop&q=85',
  },
  {
    id: 'slide-3',
    badge: 'HOME UPGRADES',
    discount: 'FROM ৳999',
    title: 'Modern Kitchen & Living',
    subtitle: 'Digital air fryers, blenders & home appliances',
    buttonText: 'Grab Deals',
    buttonLink: '/shop?category=Home+%26+Kitchen+Appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&auto=format&fit=crop&q=85',
  }
];

export interface HeroBannerProps {
  preset?: string;
  bgColor?: string;
}

// Side promo banners are switched OFF. Set to true to show them again.
const SHOW_SIDE_BANNERS = false;
// Text panel on the hero is switched OFF (the slide image carries the message). Set to true to show it again.
const SHOW_HERO_TEXT = false;

export function HeroBanner({ bgColor }: HeroBannerProps = {}) {
  const { heroSlides, smallBanner1, smallBanner2 } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const banner1 = smallBanner1 || {
    title: 'Festive Attire',
    badge: '40% OFF',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Men%27s+Fashion',
  };

  const banner2 = smallBanner2 || {
    title: 'Smart Gear',
    badge: '৳999+',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Electronics+%26+Gadgets',
  };

  const activeSlides = (heroSlides && heroSlides.length > 0) ? heroSlides : HERO_SLIDES;
  const slide = activeSlides[currentSlide] || activeSlides[0] || HERO_SLIDES[0];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    swiped.current = false;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    swiped.current = true;
    if (dx < 0) nextSlide();
    else prevSlide();
  };

  return (
    <div
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="relative w-full bg-app-bg py-3 sm:py-5"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setIsPaused(true); }}
      onPointerLeave={() => setIsPaused(false)}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') setIsPaused(false); }}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 lg:items-start">

          {/* Main Hero Banner: slide image fills the whole banner */}
          <div className={`relative ${SHOW_SIDE_BANNERS ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
            <div
              className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-[440px] lg:h-[520px] rounded-card overflow-hidden bg-surface-subtle border border-border shadow-xs group gpu-smooth touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClickCapture={(e) => {
                if (swiped.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  swiped.current = false;
                }
              }}
            >

              {/* Full image: the whole banner is clickable */}
              <div
                className="absolute inset-0 z-10 flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {activeSlides.map((s, i) => (
                  <Link
                    key={`${s.id}-${i}`}
                    href={s.buttonLink || '/shop'}
                    aria-label={s.title}
                    tabIndex={i === currentSlide ? 0 : -1}
                    className="relative block h-full w-full shrink-0 cursor-pointer"
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                ))}
              </div>

              {/* Top progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-border z-30 overflow-hidden">
                <div
                  key={currentSlide}
                  onAnimationEnd={nextSlide}
                  className="h-full bg-primary animate-[progressFill_4s_linear_forwards]"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                />
              </div>

              {SHOW_HERO_TEXT ? (
                <div className="absolute bottom-4 left-4 sm:left-14 z-20 max-w-[85%] sm:max-w-md bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-3 sm:p-5 shadow-xs">
                  <div className="mb-2 sm:mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-2xs sm:text-xs font-bold tracking-wide">
                      <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                      <span>{slide.badge}</span>
                      <span className="opacity-60">•</span>
                      <span className="font-extrabold">{slide.discount || 'MEGA DEAL'}</span>
                    </div>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-text-main tracking-tight leading-tight font-sans line-clamp-2">
                    {slide.title}
                  </h1>
                  <p className="text-text-muted text-xs sm:text-sm mt-1 sm:mt-2 font-medium line-clamp-1 sm:line-clamp-2">
                    {slide.subtitle}
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    <Link
                      href={slide.buttonLink || '/shop'}
                      className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                      <span className="text-white font-bold leading-none">
                        {slide.buttonText || 'Shop Now'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                    </Link>
                  </div>
                </div>
              ) : (
                <h1 className="sr-only">{slide.title}</h1>
              )}

              {/* Carousel Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs items-center justify-center transition-all hover:scale-105 cursor-pointer hidden sm:flex"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs items-center justify-center transition-all hover:scale-105 cursor-pointer hidden sm:flex"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentSlide(i);
                    }}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlide
                        ? 'w-6 bg-primary shadow-xs'
                        : 'w-1.5 bg-white/60 shadow-xs hover:bg-white'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {SHOW_SIDE_BANNERS && (
            /* 2 Side Promo Cards: image on top, text below. Mobile/tablet: 2 columns below the main card. Desktop: stacked. */
            <div className="lg:col-span-4 xl:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5">

              <Link
                href={banner1.link}
                className="group flex flex-col overflow-hidden rounded-card bg-surface border border-border p-2 sm:p-2.5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 h-[170px] sm:h-[190px] lg:h-[195px] gpu-smooth"
              >
                <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-surface-subtle">
                  <Image
                    src={banner1.image}
                    alt={banner1.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 50vw, 350px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="pt-2 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 px-1.5 py-0.5 rounded-button bg-primary text-2xs font-black uppercase tracking-wider text-white">
                      {banner1.badge}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-text-main leading-tight font-sans truncate">
                      {banner1.title}
                    </h3>
                  </div>
                  <span className="text-2xs sm:text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>{'Explore'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                </div>
              </Link>

              <Link
                href={banner2.link}
                className="group flex flex-col overflow-hidden rounded-card bg-surface border border-border p-2 sm:p-2.5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 h-[170px] sm:h-[190px] lg:h-[195px] gpu-smooth"
              >
                <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-surface-subtle">
                  <Image
                    src={banner2.image}
                    alt={banner2.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 50vw, 350px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="pt-2 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0 px-1.5 py-0.5 rounded-button bg-primary text-2xs font-black uppercase tracking-wider text-white">
                      {banner2.badge}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-text-main leading-tight font-sans truncate">
                      {banner2.title}
                    </h3>
                  </div>
                  <span className="text-2xs sm:text-xs font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>{'Shop Gear'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                </div>
              </Link>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
