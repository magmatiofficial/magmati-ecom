/**
 * @file app/shop/page.tsx
 * @description Server-rendered Product Catalog / Shop route providing rich SEO parameters and metadata.
 */

import React from 'react';
import { Metadata } from 'next';
import { ShopPageClient } from '@/components/shop/ShopPageClient';

interface Props {
  searchParams: Promise<{ category?: string; q?: string; brand?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category || 'All';
  const query = resolvedParams.q || '';
  
  let title = 'Premium Fashion & Marketplace Catalog | MAGMATI';
  let description = 'Explore MAGMATI\'s premier multi-category product collections in Bangladesh. Shop Panjabis, Sarees, Home Décor, electronics, and authentic products.';

  if (category !== 'All') {
    title = `Shop ${category} Collection Online | MAGMATI`;
    description = `Discover premium authentic ${category} items at MAGMATI. Cash on Delivery across 64 districts in Bangladesh with easy exchanges.`;
  } else if (query) {
    title = `Search Results for "${query}" | MAGMATI`;
    description = `Browse high-quality product listings matching "${query}" on MAGMATI Bangladesh. Fast delivery and secure payments.`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';
  const canonicalUrl = category !== 'All' 
    ? `${siteUrl}/shop?category=${encodeURIComponent(category)}`
    : `${siteUrl}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} - MAGMATI Bangladesh`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default function ShopPage() {
  return <ShopPageClient />;
}
