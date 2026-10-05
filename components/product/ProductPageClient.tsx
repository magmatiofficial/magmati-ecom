'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { products as fallbackProducts } from '@/data/products';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { ProductGrid } from '@/components/product/ProductGrid';

interface ProductPageClientProps {
  productId: string;
}

export function ProductPageClient({ productId }: ProductPageClientProps) {
  const storeProducts = useProductStore((state) => state.products);

  const product = React.useMemo(() => {
    const list = storeProducts && storeProducts.length > 0 ? storeProducts : fallbackProducts;
    return list.find((p) => p.id === productId || p.slug === productId);
  }, [storeProducts, productId]);

  // Related products in the same category
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    const list = storeProducts && storeProducts.length > 0 ? storeProducts : fallbackProducts;
    return list
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [storeProducts, product]);

  if (!product) {
    return (
      <div className="min-h-[60dvh] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-sans text-2xl font-bold text-zinc-900 mb-2">
          {'Product Not Found'}
        </h1>
        <p className="text-xs text-zinc-500 mb-6">
          The requested garment could not be found in our current catalog.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors"
        >
          {'Return to Shop'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg pb-24 lg:pb-16">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-zinc-200/90 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-eyebrow text-zinc-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-primary transition-colors">
              {'Home'}
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <Link href="/shop" className="hover:text-primary transition-colors">
              {'Shop'}
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-primary transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="font-semibold text-text-main truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Presentation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left: Gallery (Fitted to viewport & sticky on desktop) */}
          <div className="lg:col-span-7 lg:sticky lg:top-20">
            <ProductGallery 
              product={product}
              media={product.media}
              images={product.images} 
              productName={product.name} 
            />
          </div>

          {/* Right: Details & Actions */}
          <div className="lg:col-span-5">
            <ProductDetails product={product} />
          </div>
        </div>

        {/* Product Reviews & Rating System */}
        <ProductReviewsSection product={product} />

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-2xs font-bold text-primary uppercase tracking-widest block mb-1">
                  {'YOU MAY ALSO LIKE'}
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-text-main">
                  {'Similar Festive Garments'}
                </h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-primary hover:text-primary-hover uppercase tracking-wider"
              >
                {'View All'}
              </Link>
            </div>

            <ProductGrid products={relatedProducts} columns={4} />
          </section>
        )}
      </div>
    </div>
  );
}
