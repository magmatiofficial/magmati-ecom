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

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  ShoppingBag,
  Zap
} from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

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

export function HeroBanner({ bgColor }: HeroBannerProps = {}) {
  const { heroSlides, smallBanner1, smallBanner2 } = useSiteSettingsStore();
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

  // Clean 5.5s autoplay timer without layout-thrashing 50ms re-render loop
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div 
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      className="relative w-full bg-app-bg py-2 sm:py-3.5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6">
        
        {/* Main Grid: Hero Carousel (Col-8/9) + 2 Sub Promo Banners (Col-4/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 lg:gap-4">
          
          {/* Main Hero Carousel */}
          <div className="lg:col-span-8 xl:col-span-9 relative">
            
            <div className="relative w-full h-[235px] sm:h-[275px] md:h-[320px] lg:h-[400px] rounded-card overflow-hidden shadow-lg border border-border-color bg-surface-dark group gpu-smooth">
              
              {/* Dark backdrop placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 z-0" />

              {/* Background Product Image with subtle zoom on hover */}
              <div className="absolute inset-0 w-full h-full z-1">
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover object-center sm:object-right transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Soft, Transparent Gradient - leaves the product/model clear and visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent z-10" />

              {/* Top Smooth Timer Progress Bar (Pure CSS GPU Animation) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
                <div 
                  key={currentSlide}
                  className="h-full bg-gradient-to-r from-brand-gold to-primary animate-[progressFill_5.5s_linear_infinite]"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                />
              </div>

              {/* Content Box - cleanly aligned without blocking focal elements */}
              <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-8 lg:px-10 max-w-[75%] sm:max-w-md lg:max-w-lg text-white">
                
                {/* Sleek Glassmorphic Tag (Combines badge + discount elegantly) */}
                <div className="mb-1.5 sm:mb-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-brand-gold text-2xs sm:text-xs font-bold tracking-wide shadow-sm">
                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-brand-gold text-brand-gold shrink-0" />
                    <span>{slide.badge}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white font-extrabold">
                      {slide.discount || 'MEGA DEAL'}
                    </span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-base sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md font-sans">
                  {slide.title}
                </h1>

                {/* Minimal Subtitle */}
                <p className="text-zinc-200 text-2xs sm:text-xs lg:text-sm mt-1 sm:mt-1.5 font-medium line-clamp-1 drop-shadow-xs">
                  {slide.subtitle}
                </p>

                {/* CTA Action Button */}
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <Link
                    href={slide.buttonLink || '/shop'}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-button bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-white/20 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                    <span className="text-white font-bold leading-none">
                      {slide.buttonText || 'Shop Now'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

              </div>

              {/* Carousel Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-105 cursor-pointer hidden sm:flex"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-105 cursor-pointer hidden sm:flex"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Minimal Dot Indicators */}
              <div className="absolute bottom-2.5 left-4 sm:left-8 z-20 flex items-center gap-1.5">
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
                        ? 'w-6 bg-brand-gold shadow-xs'
                        : 'w-1.5 bg-white/40 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

            </div>

          </div>

          {/* 2 Sub Promo Banners:
              - No top badges obstructing the model's head or product center!
              - Only soft bottom gradient with sleek, readable bottom-docked info.
              - Mobile & Tablet: 2-column side-by-side grid.
              - Desktop (lg): 1-column stacked grid matching main banner height.
          */}
          <div className="lg:col-span-4 xl:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 lg:gap-3.5">
            
            {/* Sub Banner 1: Festive Fashion */}
            <Link
              href={banner1.link}
              className="group relative overflow-hidden rounded-card bg-surface-dark text-white p-3 sm:p-4 border border-border-color shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-end h-[128px] sm:h-[145px] md:h-[160px] lg:h-[194px] gpu-smooth"
            >
              {/* Full Background Product Image */}
              <div className="absolute inset-0 w-full h-full bg-surface-dark">
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

              {/* Bottom Subtle Gradient only (Top is completely clear!) */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent z-10" />

              {/* Docked Bottom Content */}
              <div className="relative z-20 flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-button bg-primary text-2xs sm:text-2xs font-black uppercase tracking-wider text-white shadow-xs">
                    {banner1.badge}
                  </span>
                  <h3 className="text-xs sm:text-sm lg:text-base font-black text-white leading-tight font-sans drop-shadow-md truncate">
                    {banner1.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xs sm:text-xs font-bold text-brand-gold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>{'Explore'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Sub Banner 2: Smart Gadgets */}
            <Link
              href={banner2.link}
              className="group relative overflow-hidden rounded-card bg-surface-dark text-white p-3 sm:p-4 border border-border-color shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-end h-[128px] sm:h-[145px] md:h-[160px] lg:h-[194px] gpu-smooth"
            >
              {/* Full Background Product Image */}
              <div className="absolute inset-0 w-full h-full bg-zinc-900">
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

              {/* Bottom Subtle Gradient only (Top is completely clear!) */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent z-10" />

              {/* Docked Bottom Content */}
              <div className="relative z-20 flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-2xs sm:text-2xs font-black uppercase tracking-wider text-white shadow-xs">
                    {banner2.badge}
                  </span>
                  <h3 className="text-xs sm:text-sm lg:text-base font-black text-white leading-tight font-sans drop-shadow-md truncate">
                    {banner2.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xs sm:text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>{'Shop Gear'}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                </div>
              </div>
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}
