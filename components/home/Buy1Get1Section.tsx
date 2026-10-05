'use client';

import React from 'react';
import Image from 'next/image';
import { Gift, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { formatBDT } from '@/lib/formatCurrency';

interface Buy1Get1SectionProps {
  title?: string;
  subtitle?: string;
}

export function Buy1Get1Section({ title, subtitle }: Buy1Get1SectionProps) {
  const { b1g1Offers } = useSiteSettingsStore();
  const { products } = useProductStore();
  const { addItem } = useCartStore();

  const fallbackOffers = [
    {
      id: 'b1g1-demo-1',
      title: 'Buy Smartwatch, Get Waterproof Speaker FREE',
      subtitle: 'Receive a 360° Surround Sound Wireless Speaker completely free with this watch order!',
      badge: 'BUY 1 GET 1 FREE',
      buyProductId: 'elec-ultra-watch-pro',
      buyQuantity: 1,
      getProductId: 'elec-bluetooth-speaker',
      getQuantity: 1,
      enabled: true,
    },
  ];

  const rawOffers = b1g1Offers && b1g1Offers.length > 0 ? b1g1Offers : fallbackOffers;

  // Resolve each offer with strict exact product ID lookup
  const resolvedOffers = rawOffers
    .filter((o) => o.enabled && o.buyProductId && o.getProductId)
    .map((offer) => {
      const buyProduct = products.find((p) => p.id === offer.buyProductId);
      const getProduct = products.find((p) => p.id === offer.getProductId);

      if (!buyProduct || !getProduct) return null;

      return {
        ...offer,
        buyProduct,
        getProduct,
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  // If no offers can be resolved with valid products, safely return null
  if (resolvedOffers.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="p-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Gift className="w-4 h-4 text-amber-600" />
            </span>
            <span className="text-2xs font-extrabold uppercase tracking-widest text-amber-600">
              {'BUY 1 GET 1 FREE (B1G1)'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {title || 'Buy 1 Get 1 Free Offers'}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resolvedOffers.map((offer) => {
          return (
            <div 
              key={offer.id}
              className="bg-gradient-to-br from-amber-50/20 to-orange-50/10 border border-amber-200/80 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header Badge */}
              <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-2xs font-black uppercase tracking-wider">
                  {offer.badge || 'PROMOTIONAL OFFER'}
                </span>
                <span className="text-2xs font-black uppercase bg-white text-amber-700 px-2 py-0.5 rounded-full">
                  {'100% FREE'}
                </span>
              </div>

              {/* Offer visual */}
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-800">
                    {offer.title}
                  </h3>
                  {offer.subtitle && (
                    <p className="text-2xs sm:text-2xs text-zinc-500 mt-1 italic font-medium">
                      {offer.subtitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-3 items-center">
                  {/* Qualifying buy product */}
                  <div className="col-span-2 text-center space-y-1.5">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-200 bg-white">
                      <Image 
                        src={offer.buyProduct.images?.[0] || 'https://picsum.photos/300/300'}
                        alt={offer.buyProduct.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-2xs font-extrabold text-zinc-800 line-clamp-1">
                      {offer.buyProduct.name}
                    </p>
                    <p className="text-2xs font-bold text-amber-700">
                      {'BUY THIS'}
                    </p>
                  </div>

                  {/* Right arrows linkages */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="text-amber-500 animate-pulse">
                      <ArrowRightLeft className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Free reward product */}
                  <div className="col-span-2 text-center space-y-1.5">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-amber-200 bg-white">
                      <Image 
                        src={offer.getProduct.images?.[0] || 'https://picsum.photos/300/300'}
                        alt={offer.getProduct.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-2xs font-extrabold text-zinc-800 line-clamp-1">
                      {offer.getProduct.name}
                    </p>
                    <p className="text-2xs font-bold text-emerald-600 animate-bounce">
                      {'GET THIS FREE!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <div className="px-5 py-4.5 border-t border-amber-100 flex items-center justify-between bg-amber-50/20">
                <div className="flex flex-col">
                  <span className="text-2xs text-zinc-400 font-bold uppercase">
                    {'PURCHASE PRICE'}
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-700">
                    {formatBDT(offer.buyProduct.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => addItem(offer.buyProduct, undefined, undefined, 1, true, true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-2xs font-extrabold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-3xs"
                >
                  <span>{'Claim Offer'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
