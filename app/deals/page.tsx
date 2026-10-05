/**
 * @file app/deals/page.tsx
 * @description Server-rendered Deals Hub with unique SEO metadata.
 */

import React from 'react';
import { Metadata } from 'next';
import { BestDealsPageClient } from '@/components/best-deals/BestDealsPageClient';

export const metadata: Metadata = {
  title: 'Discount Codes, Coupons & Campaign Deals | MAGMATI',
  description: 'Explore active discount campaigns, coupon codes, and bundle offers at MAGMATI. Shop authentic garments at the absolute best market value with hassle-free shipping.',
  alternates: {
    canonical: 'https://magmati.com/deals',
  },
  openGraph: {
    title: 'Discount Codes, Coupons & Campaign Deals | MAGMATI',
    description: 'Save extra on fashion, babies, and home goods with MAGMATI promotional deals. Check out active discount coupons today.',
    url: 'https://magmati.com/deals',
    type: 'website',
  },
};

export default function DealsRoute() {
  return <BestDealsPageClient />;
}
