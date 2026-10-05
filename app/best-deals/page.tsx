/**
 * @file app/best-deals/page.tsx
 * @description Server-rendered Best Deals page with dedicated SEO metadata.
 */

import React from 'react';
import { Metadata } from 'next';
import { BestDealsPageClient } from '@/components/best-deals/BestDealsPageClient';

export const metadata: Metadata = {
  title: 'Best Deals & Curated Sales Hub | MAGMATI',
  description: 'Uncover premium seasonal garment discounts and limited-edition sales at MAGMATI. Handpicked deals for style-conscious shoppers across Bangladesh.',
  alternates: {
    canonical: 'https://magmati.com/best-deals',
  },
  openGraph: {
    title: 'Best Deals & Curated Sales Hub | MAGMATI Bangladesh',
    description: 'Save big on premium Panjabis, Sarees, Home Décor, and authentic garments with nationwide Cash on Delivery.',
    url: 'https://magmati.com/best-deals',
    type: 'website',
  },
};

export default function BestDealsPage() {
  return <BestDealsPageClient />;
}
