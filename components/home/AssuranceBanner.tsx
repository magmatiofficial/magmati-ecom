/**
 * @file components/home/AssuranceBanner.tsx
 * @description The MAGMATI Marketplace brand promise banner highlighting authenticity, nationwide COD, official warranty, and easy replacements.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, RefreshCw, Headphones, ArrowRight } from 'lucide-react';

export function AssuranceBanner() {
  const pillars = [
    {
      icon: ShieldCheck,
      titleEn: '100% Genuine & Verified',
      descEn: 'Authentic electronics, premium apparel, and safe baby products directly sourced from verified distributors.',
    },
    {
      icon: Truck,
      titleEn: 'Nationwide Express COD',
      descEn: 'Doorstep cash on delivery across all 64 districts in Bangladesh with rapid tracking.',
    },
    {
      icon: RefreshCw,
      titleEn: '7-Day Easy Replacement',
      descEn: 'Hassle-free replacement policy for defective gadgets or sizing adjustments.',
    },
    {
      icon: Headphones,
      titleEn: 'Dedicated 24/7 Helpline',
      descEn: 'Hotline and WhatsApp customer care for order guidance and warranty assistance.',
    },
  ];

  return (
    <section className="bg-white border-t border-zinc-200 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center sm:items-start sm:text-left p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-primary transition-[border-color,box-shadow] duration-200">
                <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-sans text-sm font-bold text-text-main mb-1.5">
                  {item.titleEn}
                </h4>
                <p className="font-sans text-xs text-zinc-500 leading-relaxed">
                  {item.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Brand Promise Callout */}
        <div className="bg-secondary rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl border border-zinc-800">
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold block mb-3 font-sans">
              {'THE MAGMATI MARKETPLACE PROMISE'}
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              {'Free Delivery on Premium Orders'}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              {'Experience effortless online shopping with verified authentic electronics, lifestyle garments, kitchen appliances, and doorstep cash delivery.'}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-app-inverse font-sans font-bold text-xs tracking-widest uppercase transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <span>{'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
