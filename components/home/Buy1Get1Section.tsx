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

interface Buy1Get1SectionProps {
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

export function Buy1Get1Section({ title, subtitle, embedded }: Buy1Get1SectionProps) {
  const { b1g1Offers } = useSiteSettings();
  const { products } = useProducts();
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
  if (resolvedOffers.length === 0) {
    if (embedded) {
      return <p className="p-4 text-sm text-zinc-500">No offers available right now.</p>;
    }
    return null;
  }

  if (embedded) {
    return (
      <div className="flex items-stretch gap-3 overflow-x-auto scroll-smooth snap-x p-3 sm:p-4 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {resolvedOffers.map((offer) => (
          <PromoDealSlot key={offer.id} sizerProduct={offer.buyProduct}>
            <PromoDealCard
              compact
              tone="free"
              badge={offer.badge || 'PROMOTIONAL OFFER'}
              chip="100% FREE"
              title={offer.title}
              subtitle={offer.subtitle}
              items={[
                {
                  id: offer.buyProduct.id,
                  name: offer.buyProduct.name,
                  image: offer.buyProduct.images?.[0],
                  caption: 'Buy this',
                },
                {
                  id: offer.getProduct.id,
                  name: offer.getProduct.name,
                  image: offer.getProduct.images?.[0],
                  caption: `Worth ${formatBDT(offer.getProduct.price)}`,
                  highlight: true,
                },
              ]}
              priceLabel="You pay"
              price={formatBDT(offer.buyProduct.price)}
              savingsText={`You save ${formatBDT(offer.getProduct.price)} on the free item`}
              ctaLabel="Claim Offer"
              disabled={!isInStock(offer.buyProduct) || !isInStock(offer.getProduct)}
              onAction={() => addItem(offer.buyProduct, undefined, undefined, 1, true, true)}
            />
          </PromoDealSlot>
        ))}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-sans animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-br from-primary-subtle via-white to-primary-subtle/60 border border-primary/10 p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 mb-4 sm:mb-6">
          {title || 'Buy 1 Get 1 Free Offers'}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 font-medium -mt-3 mb-4 sm:mb-6">
            {subtitle}
          </p>
        )}

        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6', resolvedOffers.length === 1 && 'max-w-3xl mx-auto w-full')}>
          {resolvedOffers.map((offer) => (
            <PromoDealCard
              key={offer.id}
              tone="free"
              badge={offer.badge || 'PROMOTIONAL OFFER'}
              chip="100% FREE"
              title={offer.title}
              subtitle={offer.subtitle}
              items={[
                {
                  id: offer.buyProduct.id,
                  name: offer.buyProduct.name,
                  image: offer.buyProduct.images?.[0],
                  caption: 'Buy this',
                },
                {
                  id: offer.getProduct.id,
                  name: offer.getProduct.name,
                  image: offer.getProduct.images?.[0],
                  caption: `Worth ${formatBDT(offer.getProduct.price)}`,
                  highlight: true,
                },
              ]}
              priceLabel="You pay"
              price={formatBDT(offer.buyProduct.price)}
              savingsText={`You save ${formatBDT(offer.getProduct.price)} on the free item`}
              ctaLabel="Claim Offer"
              disabled={!isInStock(offer.buyProduct) || !isInStock(offer.getProduct)}
              onAction={() => addItem(offer.buyProduct, undefined, undefined, 1, true, true)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
