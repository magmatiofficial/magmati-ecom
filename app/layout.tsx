/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { interFont, notoBengaliFallback } from '@/app/fonts';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import AnalyticsTracker from '@/components/layout/AnalyticsTracker';
import { Suspense } from 'react';
import { safeJsonLd } from '@/lib/jsonLd';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#D12929',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MAGMATI – Premium Online Shopping in Bangladesh',
    template: '%s | MAGMATI',
  },
  description: 'MAGMATI is Bangladesh\'s premier online shopping destination featuring Fashion, Electronics, Home Appliances, Baby Care, and authentic products with nationwide Cash on Delivery in BDT.',
  keywords: [
    'MAGMATI',
    'Online Shopping Bangladesh',
    'E-commerce Bangladesh',
    'Fashion Store BD',
    'Panjabi Bangladesh',
    'Saree BD',
    'Electronics Shopping BD',
    'Cash on Delivery Bangladesh',
    'Magmati Shopping App',
  ],
  authors: [{ name: 'MAGMATI', url: siteUrl }],
  publisher: 'MAGMATI',
  category: 'E-Commerce Marketplace',
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'MAGMATI – Premium Online Shopping in Bangladesh',
    description: 'Shop authentic Fashion, Electronics, Home Appliances, Baby Care, and authentic products. Fast delivery across 64 districts in Bangladesh with Cash on Delivery.',
    url: siteUrl,
    siteName: 'MAGMATI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: 'MAGMATI Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAGMATI – Premium Online Shopping in Bangladesh',
    description: 'Shop authentic Fashion, Electronics, Home Appliances, Baby Care, and authentic products. Fast delivery across 64 districts in Bangladesh with Cash on Delivery.',
    site: '@magmati',
    images: [`${siteUrl}/icon.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Schema.org Structured Data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MAGMATI',
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    description: 'Premier multi-category online shopping marketplace in Bangladesh.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1700-000000',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['English'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MAGMATI',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const storeSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'MAGMATI',
    url: siteUrl,
    description: 'Shop authentic clothing, electronics, home decor and baby care products in Bangladesh.',
    priceRange: '৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, bKash, Nagad, Rocket, Credit Card',
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${interFont.variable} ${notoBengaliFallback.variable}`}
    >
      <head>
        {/* Google Fonts Preconnect & Stylesheets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(storeSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-app-bg text-app-text selection:bg-primary/15 selection:text-primary"
      >
        <ErrorBoundary>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <AppLayout>
            {children}
          </AppLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
