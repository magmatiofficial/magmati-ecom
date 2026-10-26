/**
 * @file components/home/HeroBanner.tsx
 * @description Ultra-premium campaign Hero Banner with automatic sliding carousel, auto-play timer, smooth navigation arrows, dot indicators, and dynamic admin layout control.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop&q=85',
    buttonLink: '/shop?category=Electronics+%26+Gadgets',
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop&q=85',
    buttonLink: '/shop?category=Men%27s+Fashion',
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&auto=format&fit=crop&q=85',
    buttonLink: '/shop?category=Home+%26+Kitchen+Appliances',
  }
];

export interface HeroBannerProps {
  preset?: string;
  bgColor?: string;
}

export function HeroBanner({ bgColor }: HeroBannerProps = {}) {
  const { heroSlides, smallBanner1, smallBanner2, bannerLayoutMode = 'hero_only', heroAutoPlayIntervalSeconds = 5 } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const banner1 = smallBanner1 || {
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Men%27s+Fashion',
  };

  const banner2 = smallBanner2 || {
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    link: '/shop?category=Electronics+%26+Gadgets',
  };

  const rawSlides = (heroSlides && heroSlides.length > 0) ? heroSlides : HERO_SLIDES;
  const activeSlides = rawSlides.map((s: any) => ({
    id: s.id || Math.random().toString(),
    image: s.image,
    buttonLink: s.buttonLink || s.link || '/shop',
  }));

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const intervalMs = Math.max(1, heroAutoPlayIntervalSeconds || 5) * 1000;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, activeSlides.length, nextSlide, heroAutoPlayIntervalSeconds]);

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

  const showSideBanners = bannerLayoutMode === 'hero_plus_one_small' || bannerLayoutMode === 'hero_plus_two_smalls';

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

          {/* Main Hero Banner with Auto-Slide Carousel */}
          <div className={`relative ${showSideBanners ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}`}>
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
              <div
                className="absolute inset-0 z-10 flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {activeSlides.map((s, idx) => (
                  <div key={s.id || idx} className="relative w-full h-full shrink-0">
                    <Link href={s.buttonLink || '/shop'} className="absolute inset-0 block w-full h-full cursor-pointer">
                      <Image
                        src={s.image}
                        alt="Banner Slide"
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 1100px"
                        className="object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition" />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Carousel Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-xs">
                {activeSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlide
                        ? 'w-7 bg-white shadow'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Side Promo Banners */}
          {showSideBanners && (
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 sm:gap-4 lg:gap-5 h-full">
              {bannerLayoutMode === 'hero_plus_one_small' ? (
                <Link
                  href={banner1.link || '/shop'}
                  className="group relative flex overflow-hidden rounded-card bg-surface border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 w-full aspect-[16/10] sm:aspect-auto sm:h-[440px] lg:h-[520px] gpu-smooth"
                >
                  <div className="relative w-full h-full overflow-hidden bg-surface-subtle">
                    {banner1.image ? (
                      <Image
                        src={banner1.image}
                        alt="Promotional Banner 1"
                        fill
                        sizes="(max-width: 1024px) 100vw, 350px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">Promo Banner 1</div>
                    )}
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    href={banner1.link || '/shop'}
                    className="group relative flex overflow-hidden rounded-card bg-surface border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 w-full h-[180px] sm:h-[212px] lg:h-[250px] gpu-smooth"
                  >
                    <div className="relative w-full h-full overflow-hidden bg-surface-subtle">
                      {banner1.image ? (
                        <Image
                          src={banner1.image}
                          alt="Promotional Banner 1"
                          fill
                          sizes="(max-width: 1024px) 50vw, 350px"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">Promo Banner 1</div>
                      )}
                    </div>
                  </Link>

                  <Link
                    href={banner2.link || '/shop'}
                    className="group relative flex overflow-hidden rounded-card bg-surface border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 w-full h-[180px] sm:h-[212px] lg:h-[250px] gpu-smooth"
                  >
                    <div className="relative w-full h-full overflow-hidden bg-surface-subtle">
                      {banner2.image ? (
                        <Image
                          src={banner2.image}
                          alt="Promotional Banner 2"
                          fill
                          sizes="(max-width: 1024px) 50vw, 350px"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">Promo Banner 2</div>
                      )}
                    </div>
                  </Link>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
