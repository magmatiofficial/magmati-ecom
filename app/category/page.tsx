/**
 * @file app/category/page.tsx
 * @description Server-rendered Category Index page providing structured SEO metadata.
 */

import React from 'react';
import { Metadata } from 'next';
import { CategoryPageClient } from '@/components/category/CategoryPageClient';

export const metadata: Metadata = {
  title: 'Explore Collections & Departments | MAGMATI',
  description: 'Browse curated collections at MAGMATI. Shop Bangladesh\'s finest online ethnic clothing, contemporary wear, leather goods, and premium accessories in BDT.',
  alternates: {
    canonical: 'https://magmati.com/category',
  },
  openGraph: {
    title: 'Explore Collections & Departments | MAGMATI Bangladesh',
    description: 'Browse curated categories including Men\'s Fashion, Women\'s Saree, Kids Wear, and Home Appliances with Cash on Delivery nationwide.',
    url: 'https://magmati.com/category',
    type: 'website',
  },
};

export default function CategoryPage() {
  return <CategoryPageClient />;
}
