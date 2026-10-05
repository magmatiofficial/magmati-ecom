'use client';

import React from 'react';
import Image from 'next/image';
import { Package, ArrowRight } from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { formatBDT } from '@/lib/formatCurrency';

interface ComboProductsSectionProps {
  title?: string;
  subtitle?: string;
}

export function ComboProductsSection({ title, subtitle }: ComboProductsSectionProps) {
  const { combos } = useSiteSettingsStore();
  const { products } = useProductStore();
  const { addComboBundle } = useCartStore();

  const fallbackCombos = [
    {
      id: 'combo-demo-1',
      title: 'Smart Tech Power Bundle',
      subtitle: 'Ultra AMOLED Smartwatch + 20,000mAh Power Bank',
      badge: 'MEGA SAVINGS BUNDLE',
      comboPrice: 4800,
      originalPrice: 6400,
      enabled: true,
      items: [
        { productId: 'elec-ultra-watch-pro', quantity: 1 },
        { productId: 'elec-powerbank-20000', quantity: 1 },
      ],
    },
  ];

  const rawCombos = combos && combos.length > 0 ? combos : fallbackCombos;

  // Resolve each combo with strict exact product ID lookup
  const resolvedCombos = rawCombos
    .filter((c) => c.enabled && c.items && c.items.length >= 2)
    .map((combo) => {
      const resolvedItems = combo.items
        .map((ci) => {
          const prod = products.find((p) => p.id === ci.productId);
          return prod ? { product: prod, quantity: ci.quantity } : null;
        })
        .filter((item): item is { product: NonNullable<typeof item>['product']; quantity: number } => item !== null);

      if (resolvedItems.length < 2) return null;

      const originalSum = resolvedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const savings = originalSum - combo.comboPrice;

      return {
        ...combo,
        resolvedItems,
        originalSum,
        savings,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // If no combos can be resolved with valid products, safely return null
  if (resolvedCombos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="p-1 rounded bg-primary/10 text-primary border border-primary/20">
              <Package className="w-4 h-4" />
            </span>
            <span className="text-2xs font-extrabold uppercase tracking-widest text-primary">
              {'COMBO DEALS'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {title || 'Mega Combo & Bundles'}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resolvedCombos.map((combo) => {
          return (
            <div 
              key={combo.id}
              className="bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header Badge */}
              <div className="bg-zinc-900 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-2xs font-black uppercase tracking-wider text-amber-400">
                  {combo.badge || 'SPECIAL MULTI-BUY BUNDLE'}
                </span>
                {combo.savings > 0 && (
                  <span className="text-2xs font-black bg-primary text-white px-2 py-0.5 rounded-full">
                    {'SAVE '}৳{combo.savings}
                  </span>
                )}
              </div>

              {/* Items display */}
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-800">
                    {combo.title}
                  </h3>
                </div>

                {combo.subtitle && (
                  <p className="text-2xs sm:text-xs text-zinc-500 italic mt-0.5">
                    {combo.subtitle}
                  </p>
                )}

                <div className="grid grid-cols-5 gap-3 items-center pt-2">
                  {/* Item 1 */}
                  <div className="col-span-2 text-center space-y-1.5">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                      <Image 
                        src={combo.resolvedItems[0].product.images?.[0] || 'https://picsum.photos/300/300'}
                        alt={combo.resolvedItems[0].product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-2xs font-extrabold text-zinc-800 line-clamp-2">
                      {combo.resolvedItems[0].product.name}
                    </p>
                    <p className="text-2xs text-zinc-400 line-through">
                      {formatBDT(combo.resolvedItems[0].product.price)}
                    </p>
                  </div>

                  {/* Plus Divider */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-500 border border-zinc-200 shadow-3xs">
                      {'+'}
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="col-span-2 text-center space-y-1.5">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                      <Image 
                        src={combo.resolvedItems[1].product.images?.[0] || 'https://picsum.photos/300/300'}
                        alt={combo.resolvedItems[1].product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-2xs font-extrabold text-zinc-800 line-clamp-2">
                      {combo.resolvedItems[1].product.name}
                    </p>
                    <p className="text-2xs text-zinc-400 line-through">
                      {formatBDT(combo.resolvedItems[1].product.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Buying Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex flex-col">
                  <span className="text-2xs text-zinc-400 font-bold uppercase">
                    {'BUNDLE PRICE'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-primary">
                      {formatBDT(combo.comboPrice)}
                    </span>
                    {combo.originalSum > combo.comboPrice && (
                      <span className="text-2xs text-zinc-400 line-through">
                        {formatBDT(combo.originalSum)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addComboBundle(combo)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-primary text-white rounded-xl text-2xs font-extrabold transition-all duration-200 flex items-center gap-1 cursor-pointer shadow-3xs hover:shadow-sm"
                >
                  <span>{'Buy Combo'}</span>
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
