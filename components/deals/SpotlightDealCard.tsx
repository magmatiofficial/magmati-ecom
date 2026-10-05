'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Flame, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';

interface SpotlightDealCardProps {
  
  spotlightProduct: Product;
  spotlightAdded: boolean;
  onAddToCart: (p: Product) => void;
}

export const SpotlightDealCard: React.FC<SpotlightDealCardProps> = ({
    spotlightProduct,
  spotlightAdded,
  onAddToCart,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-secondary rounded-3xl border border-zinc-800/80 p-4 sm:p-7 shadow-xl overflow-hidden relative text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Product Media */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700/80 group">
              <Image
                src={spotlightProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                alt={spotlightProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-primary text-app-inverse text-xs font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
                {'DEAL OF THE HOUR'}
              </div>
            </div>
          </div>

          {/* Product Info & Urgency */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary-light text-eyebrow font-bold">
                  {spotlightProduct.category}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{spotlightProduct.rating || '4.9'}</span>
                </div>
              </div>

              <Link href={`/product/${spotlightProduct.id}`}>
                <h2 className="text-xl sm:text-3xl font-black text-white hover:text-primary transition-colors leading-snug mb-3">
                  {spotlightProduct.name}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-zinc-400 mb-5 line-clamp-2 leading-relaxed font-normal">
                {spotlightProduct.description}
              </p>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl sm:text-4xl font-black text-primary font-mono">
                  ৳{(spotlightProduct.price ?? 0).toLocaleString()}
                </span>
                {spotlightProduct.originalPrice && (
                  <span className="text-sm sm:text-lg text-zinc-500 line-through font-mono">
                    ৳{(spotlightProduct.originalPrice ?? 0).toLocaleString()}
                  </span>
                )}
                {spotlightProduct.originalPrice && spotlightProduct.originalPrice > spotlightProduct.price && (
                  <span className="px-2 py-0.5 rounded-md bg-primary text-app-inverse text-xs font-black">
                    -{Math.round(((spotlightProduct.originalPrice - spotlightProduct.price) / spotlightProduct.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Stock Gauge Urgency Bar */}
              <div className="bg-zinc-800/80 rounded-xl p-3.5 border border-zinc-700/60 mb-6">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-primary-light">
                    <Flame className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span>{'Fast Selling! 82% Claimed'}</span>
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {'Only 18 Left'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-amber-500 via-primary to-primary-dark rounded-full w-[82%]" />
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onAddToCart(spotlightProduct)}
                className={`flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  spotlightAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary hover:bg-primary-hover text-app-inverse'
                }`}
              >
                {spotlightAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{'Claim Deal Now'}</span>
                  </>
                )}
              </button>

              <Link
                href={`/product/${spotlightProduct.id}`}
                className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <span>{'View Specs'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
