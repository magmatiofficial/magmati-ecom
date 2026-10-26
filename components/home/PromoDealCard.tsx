'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, Gift, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface PromoDealItem {
  id: string;
  name: string;
  image?: string;
  caption: string;
  highlight?: boolean;
}

interface PromoDealCardProps {
  tone: 'combo' | 'free';
  badge: string;
  chip?: string;
  title: string;
  subtitle?: string;
  items: [PromoDealItem, PromoDealItem];
  priceLabel: string;
  price: string;
  strikePrice?: string;
  savingsText?: string;
  ctaLabel: string;
  disabled?: boolean;
  onAction: () => void;
  compact?: boolean;
}

const TONES = {
  combo: {
    badge: 'bg-primary text-white',
    accentText: 'text-primary',
    glow: 'bg-primary/20',
    connector: 'bg-primary text-white',
    button: 'primary',
  },
  free: {
    badge: 'bg-accent text-secondary',
    accentText: 'text-accent',
    glow: 'bg-accent/20',
    connector: 'bg-accent text-secondary',
    button: 'gold',
  },
} as const;

export function PromoDealCard({
  tone,
  badge,
  chip,
  title,
  subtitle,
  items,
  priceLabel,
  price,
  strikePrice,
  savingsText,
  ctaLabel,
  disabled = false,
  onAction,
  compact = false,
}: PromoDealCardProps) {
  const t = TONES[tone];
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleAction = () => {
    if (disabled) return;
    onAction();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article
      className={cn(
        'relative isolate flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 text-white shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        compact && 'h-full'
      )}
    >
      <div
        aria-hidden="true"
        className={cn('pointer-events-none absolute -right-24 -top-24 -z-10 h-56 w-56 rounded-full blur-3xl', t.glow)}
      />

      <div className={cn('flex items-center justify-between gap-3', compact ? 'px-4 pt-3' : 'px-5 pt-5')}>
        <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', t.badge)}>
          {badge}
        </span>
        {chip && (
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white">
            {chip}
          </span>
        )}
      </div>

      <div className={cn(compact ? 'px-4 pt-2' : 'px-5 pt-4')}>
        <h3 className={cn('font-semibold leading-snug text-white', compact ? 'text-base sm:text-lg line-clamp-1' : 'text-lg sm:text-xl')}>{title}</h3>
        {!compact && subtitle && <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{subtitle}</p>}
      </div>

      <div className={cn('grid grid-cols-[1fr_auto_1fr] items-center', compact ? 'flex-1 min-h-0 px-4 py-2 gap-3' : 'gap-3 px-5 py-5 sm:gap-4')}>
        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            {idx === 1 && (
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-full shadow-card', t.connector)}>
                {tone === 'free' ? <Gift className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            )}
            <div className={cn('min-w-0 text-center', compact && 'flex h-full min-h-0 flex-col')}>
              <div
                className={cn(
                  'relative w-full overflow-hidden rounded-2xl bg-white',
                  compact ? 'flex-1 min-h-0' : 'aspect-square',
                  item.highlight ? 'ring-2 ring-accent' : 'ring-1 ring-white/10'
                )}
              >
                <Image
                  src={item.image || 'https://picsum.photos/300/300'}
                  alt={item.name}
                  fill
                  sizes="(min-width: 768px) 200px, 40vw"
                  className="object-contain p-2"
                  referrerPolicy="no-referrer"
                />
                {item.highlight && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-secondary">
                    {'Free'}
                  </span>
                )}
              </div>
              <p className={cn('font-medium text-white', compact ? 'mt-1 line-clamp-1 text-sm' : 'mt-2 line-clamp-2 text-sm')}>{item.name}</p>
              <p className={cn('mt-0.5 text-xs font-medium', item.highlight ? 'text-accent' : 'text-zinc-400')}>
                {item.caption}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className={cn('mt-auto flex border-t border-white/10 bg-white/5', compact ? 'px-4 py-3 flex-row items-center justify-between gap-3' : 'px-5 py-4 gap-3 flex-col sm:flex-row sm:items-center sm:justify-between')}>
        <div>
          <p className="text-xs font-medium text-zinc-400">{priceLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className={cn('font-semibold', t.accentText, compact ? 'text-xl' : 'text-2xl')}>{price}</span>
            {strikePrice && <span className="text-sm text-zinc-500 line-through">{strikePrice}</span>}
          </div>
          {savingsText && <p className={cn('text-xs font-medium text-emerald-400', compact && 'line-clamp-1')}>{savingsText}</p>}
        </div>
        <Button
          variant={t.button}
          size="md"
          fullWidth={!compact}
          className={compact ? 'w-auto shrink-0' : 'sm:w-auto'}
          disabled={disabled}
          onClick={handleAction}
          rightIcon={added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        >
          {disabled ? 'Out of stock' : added ? 'Added' : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
