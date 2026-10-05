/**
 * @file app/product/[id]/page.tsx
 * @description Server-rendered product page containing dynamic SEO metadata, OpenGraph cards,
 * canonical links, and Schema.org JSON-LD structured data.
 */

import React from 'react';
import { Metadata } from 'next';
import { products } from '@/data/products';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import { safeJsonLd } from '@/lib/jsonLd';

interface Props {
  params: Promise<{ id: string }>;
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const product = products.find((p) => p.id === productId || p.slug === productId);

  if (!product) {
    return {
      title: 'Product Not Found | MAGMATI',
      description: 'The requested premium garment could not be found in our current collections.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';
  const productUrl = `${siteUrl}/product/${product.id}`;
  const ogImage = product.images && product.images.length > 0 ? product.images[0] : `${siteUrl}/icon.png`;

  return {
    title: `${product.name} – Premium ${product.category} | MAGMATI`,
    description: product.description || `Buy authentic ${product.name} from MAGMATI. High quality, stylish design, with Cash on Delivery nationwide in Bangladesh.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | MAGMATI Bangladesh`,
      description: product.description || `Shop ${product.name} from MAGMATI. Cash on Delivery across 64 districts.`,
      url: productUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1000,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | MAGMATI`,
      description: product.description || `Shop ${product.name} from MAGMATI.`,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const product = products.find((p) => p.id === productId || p.slug === productId);

  if (!product) {
    return <ProductPageClient productId={productId} />;
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';

  // Schema.org Structured Data for Product
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images : [`${siteUrl}/icon.png`],
    description: product.description || `${product.name} available at MAGMATI in Bangladesh.`,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'MAGMATI',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.id}`,
      priceCurrency: 'BDT',
      price: product.price,
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MAGMATI',
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 12,
        }
      : undefined,
  };

  // Schema.org Structured Data for Breadcrumb Navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${siteUrl}/product/${product.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <ProductPageClient productId={productId} />
    </>
  );
}
