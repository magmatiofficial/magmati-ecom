/**
 * @file app/flash-deals/page.tsx
 * @description Server-rendered Flash Deals showcase page with unique, high-conversion SEO metadata.
 */

import React from 'react';
import { Metadata } from 'next';
import { BestDealsPageClient } from '@/components/best-deals/BestDealsPageClient';

export const metadata: Metadata = {
  title: 'Hourly Flash Deals & Limited Sales | MAGMATI',
  description: 'Urgent price drops! Grab high-end Bangladeshi ethnic clothing, contemporary styles, and home goods at fraction of the cost during MAGMATI Flash Sales. Nationwide COD.',
  alternates: {
    canonical: 'https://magmati.com/flash-deals',
  },
  openGraph: {
    title: 'Hourly Flash Deals & Limited Sales | MAGMATI Bangladesh',
    description: 'Extremely limited stocks! Get premium clothing, electronics, and accessories at unprecedented discounts. Buy now!',
    url: 'https://magmati.com/flash-deals',
    type: 'website',
  },
};

export default function FlashDealsRoute() {
  return <BestDealsPageClient />;
}
