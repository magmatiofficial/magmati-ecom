'use client';

import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/useCartStore';
import { isInStock } from '@/lib/stock';
import { formatBDT } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { PromoDealCard } from '@/components/home/PromoDealCard';
import { PromoDealSlot } from '@/components/home/PromoDealSlot';

interface ComboProductsSectionProps {
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

export function ComboProductsSection({ title, subtitle, embedded }: ComboProductsSectionProps) {
  const { combos } = useSiteSettings();
  const { products } = useProducts();
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
  if (resolvedCombos.length === 0) {
    if (embedded) {
      return <p className="p-4 text-sm text-zinc-500">No offers available right now.</p>;
    }
    return null;
  }

  if (embedded) {
    return (
      <div className="flex items-stretch gap-3 overflow-x-auto scroll-smooth snap-x p-3 sm:p-4 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {resolvedCombos.map((combo) => {
          const first = combo.resolvedItems[0].product;
          const second = combo.resolvedItems[1].product;
          return (
            <PromoDealSlot key={combo.id} sizerProduct={first}>
              <PromoDealCard
                compact
                tone="combo"
                badge={combo.badge || 'SPECIAL MULTI-BUY BUNDLE'}
                chip={combo.savings > 0 ? `SAVE ${formatBDT(combo.savings)}` : undefined}
                title={combo.title}
                subtitle={combo.subtitle}
                items={[
                  { id: first.id, name: first.name, image: first.images?.[0], caption: formatBDT(first.price) },
                  { id: second.id, name: second.name, image: second.images?.[0], caption: formatBDT(second.price) },
                ]}
                priceLabel="Bundle price"
                price={formatBDT(combo.comboPrice)}
                strikePrice={combo.originalSum > combo.comboPrice ? formatBDT(combo.originalSum) : undefined}
                ctaLabel="Buy Combo"
                disabled={combo.resolvedItems.some((ri) => !isInStock(ri.product, ri.quantity))}
                onAction={() => addComboBundle(combo)}
              />
            </PromoDealSlot>
          );
        })}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-sans animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-br from-primary-subtle via-white to-primary-subtle/60 border border-primary/10 p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 mb-4 sm:mb-6">
          {title || 'Mega Combo & Bundles'}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 font-medium -mt-3 mb-4 sm:mb-6">
            {subtitle}
          </p>
        )}

        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6', resolvedCombos.length === 1 && 'max-w-3xl mx-auto w-full')}>
          {resolvedCombos.map((combo) => {
            const first = combo.resolvedItems[0].product;
            const second = combo.resolvedItems[1].product;
            return (
              <PromoDealCard
                key={combo.id}
                tone="combo"
                badge={combo.badge || 'SPECIAL MULTI-BUY BUNDLE'}
                chip={combo.savings > 0 ? `SAVE ${formatBDT(combo.savings)}` : undefined}
                title={combo.title}
                subtitle={combo.subtitle}
                items={[
                  { id: first.id, name: first.name, image: first.images?.[0], caption: formatBDT(first.price) },
                  { id: second.id, name: second.name, image: second.images?.[0], caption: formatBDT(second.price) },
                ]}
                priceLabel="Bundle price"
                price={formatBDT(combo.comboPrice)}
                strikePrice={combo.originalSum > combo.comboPrice ? formatBDT(combo.originalSum) : undefined}
                ctaLabel="Buy Combo"
                disabled={combo.resolvedItems.some((ri) => !isInStock(ri.product, ri.quantity))}
                onAction={() => addComboBundle(combo)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
