'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useProductStore } from '@/store/useProductStore';
import { useCategories } from '@/hooks/useCategories';
import { useSyncStatusStore } from '@/store/useSyncStatusStore';
import { FREE_SHIPPING_THRESHOLD_BDT } from '@/lib/constants';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { formatBDT } from '@/lib/formatCurrency';
import { getNormalizedCategory, productBelongsToCategory } from '@/lib/utils';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { MobileFilterDrawer } from '@/components/shop/MobileFilterDrawer';
import { safeJsonLd } from '@/lib/jsonLd';
import { hasDiscount } from '@/lib/pricing';
import { useScrollToContent } from '@/hooks/useScrollToContent';

const BATCH_SIZE = 12;

function ShopContent({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { products } = useProductStore();
  const productsLoaded = useSyncStatusStore((state) => state.productsLoaded);
  const { categories } = useCategories();

  const activeProducts = productsLoaded ? (products || []) : [];

  // URL query params
  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('q') || searchParams.get('search') || '';
  const dealsParam = searchParams.get('deals') === 'true';
  const maxPriceParam = searchParams.get('maxPrice');
  const filterParam = searchParams.get('filter');
  const sortParam = searchParams.get('sort');
  const brandParam = searchParams.get('brand');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [searchInput, setSearchInput] = useState<string>(queryParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(dealsParam);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>(brandParam || 'All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>(() => {
    if (filterParam === 'new' || sortParam === 'newest') return 'newest';
    return 'featured';
  });
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    return maxPriceParam ? Number(maxPriceParam) : 25000;
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const isLoading = !productsLoaded;

  // Sync state whenever URL searchParams change externally (e.g. clicking navbar category link again)
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedSubcategory('All');
    setSearchInput(queryParam);
    setSearchQuery(queryParam);
    setOnlyDeals(dealsParam);
    if (brandParam) setSelectedBrand(brandParam);
  }, [categoryParam, queryParam, dealsParam, brandParam]);

  // Reset subcategory whenever main category changes
  useEffect(() => {
    setSelectedSubcategory('All');
  }, [selectedCategory]);

  // On-Scroll Progressive Batch Fetching State
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const contentRef = useScrollToContent<HTMLElement>(
    [selectedCategory, selectedSubcategory, sortBy, onlyDeals, freeShippingOnly, inStockOnly, selectedBrand, minRating].join('|')
  );
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileFilterOpen]);

  // Dynamically calculate actual product count per category using the shared helper
  const dynamicCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      itemCount:
        cat.name === 'All'
          ? activeProducts.length
          : activeProducts.filter((p) => productBelongsToCategory(p, cat)).length,
    }));
  }, [activeProducts, categories]);

  // Extract unique filter options across catalog
  const { allSizes, allColors, allBrands } = useMemo(() => {
    const sizesSet = new Set<string>();
    const colorsMap = new Map<string, string>();
    const brandsSet = new Set<string>();

    activeProducts.forEach((p) => {
      p.sizes.forEach((s) => sizesSet.add(s));
      p.colors?.forEach((c) => {
        if (!colorsMap.has(c.name)) colorsMap.set(c.name, c.hex);
      });
      if (p.brand) brandsSet.add(p.brand);
    });

    const sizes = Array.from(sizesSet);
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '38', '40', '42', '44', '46'];
    sizes.sort((a, b) => {
      const ia = sizeOrder.indexOf(a);
      const ib = sizeOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    const brands = Array.from(brandsSet).sort();

    const colorsList: Array<{ name: string; hex: string }> = [];
    colorsMap.forEach((hex, name) => {
      colorsList.push({ name, hex });
    });

    return { allSizes: sizes, allColors: colorsList, allBrands: brands };
  }, [activeProducts]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (cat === 'All') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', cat);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((p) => {
        if (selectedCategory !== 'All') {
          const selectedCat = categories.find((c) => c.name === selectedCategory);
          if (selectedCat) {
            if (!productBelongsToCategory(p, selectedCat)) return false;
          } else if (getNormalizedCategory(selectedCategory) !== getNormalizedCategory(p.category)) {
            return false;
          }
        }

        if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) {
          return false;
        }

        if (onlyDeals && !p.isFlashDeal && !p.isBestDeal && !hasDiscount(p)) {
          return false;
        }
        if (inStockOnly && (!p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0))) {
          return false;
        }
        if (freeShippingOnly && p.price < FREE_SHIPPING_THRESHOLD_BDT) {
          return false;
        }
        if (minRating > 0 && p.rating < minRating) {
          return false;
        }
        if (p.price > maxPrice) {
          return false;
        }
        if (selectedSize !== 'All' && !p.sizes.includes(selectedSize)) {
          return false;
        }
        if (selectedColor !== 'All' && !p.colors?.some((c) => c.name === selectedColor)) {
          return false;
        }
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesCategory = p.category.toLowerCase().includes(q);
          const matchesSub = p.subcategory.toLowerCase().includes(q);
          const matchesBrand = p.brand?.toLowerCase().includes(q);
          if (!matchesName && !matchesCategory && !matchesSub && !matchesBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0; // featured
      });
  }, [selectedCategory, selectedSubcategory, onlyDeals, inStockOnly, freeShippingOnly, minRating, maxPrice, selectedSize, selectedColor, selectedBrand, searchQuery, sortBy, activeProducts, categories]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    setIsLoadingMore(false);
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    onlyDeals,
    inStockOnly,
    freeShippingOnly,
    selectedSize,
    selectedColor,
    selectedBrand,
    minRating,
    maxPrice,
    sortBy,
  ]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 140);
  }, [isLoadingMore, visibleCount, filteredProducts.length]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSearchInput('');
    setSearchQuery('');
    setOnlyDeals(false);
    setInStockOnly(false);
    setFreeShippingOnly(false);
    setMinRating(0);
    setSelectedSize('All');
    setSelectedColor('All');
    setSelectedBrand('All');
    setMaxPrice(25000);
    setSortBy('featured');
    setVisibleCount(BATCH_SIZE);
  };

  const activeFilterCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedSubcategory !== 'All' ? 1 : 0) +
    (onlyDeals ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (freeShippingOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (selectedSize !== 'All' ? 1 : 0) +
    (selectedColor !== 'All' ? 1 : 0) +
    (selectedBrand !== 'All' ? 1 : 0) +
    (maxPrice < 25000 ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://magmati.com';

  const shopSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: selectedCategory === 'All' ? 'MAGMATI Product Catalog' : `${selectedCategory} - MAGMATI`,
    description: `Shop ${selectedCategory === 'All' ? 'the best deals and products' : selectedCategory} online at MAGMATI in Bangladesh.`,
    url: `${siteUrl}/shop`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredProducts.length,
      itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/product/${product.id}`,
        name: product.name,
        image: product.images?.[0] || `${siteUrl}/icon.png`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(shopSchema) }}
      />
      <ShopHeader
        selectedCategory={selectedCategory}
        totalCount={filteredProducts.length}
        loadedCount={displayedProducts.length}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        onOpenMobileFilters={() => setMobileFilterOpen(true)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewLayout={viewLayout}
        setViewLayout={setViewLayout}
        searchQuery={searchQuery}
        setSearchInput={setSearchInput}
        setSearchQuery={setSearchQuery}
        onlyDeals={onlyDeals}
        setOnlyDeals={setOnlyDeals}
        freeShippingOnly={freeShippingOnly}
        setFreeShippingOnly={setFreeShippingOnly}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        minRating={minRating}
        setMinRating={setMinRating}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        formatBDT={formatBDT}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-6 lg:gap-8 items-start mt-5">
          <div className="hidden lg:block w-72 shrink-0 sticky top-[130px] lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto [scrollbar-width:thin]">
            <FilterSidebar
              categories={dynamicCategories}
              allSizes={allSizes}
              allColors={allColors}
              allBrands={allBrands}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={setSelectedSubcategory}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              maxPrice={maxPrice}
              onChangeMaxPrice={setMaxPrice}
              minRating={minRating}
              onSelectMinRating={setMinRating}
              onlyDeals={onlyDeals}
              onToggleDeals={() => setOnlyDeals(!onlyDeals)}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          <main ref={contentRef} className="flex-1 min-w-0 scroll-mt-32">
            <ProductGrid 
              products={displayedProducts} 
              layout={viewLayout} 
              isLoading={isLoading} 
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoadingMore}
              totalCount={filteredProducts.length}
              loadedCount={displayedProducts.length}
              enableInfiniteScroll={true}
              batchSize={BATCH_SIZE}
            />
          </main>
        </div>
      </div>

      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={dynamicCategories}
        allSizes={allSizes}
        allColors={allColors}
        allBrands={allBrands}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={setSelectedSubcategory}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        maxPrice={maxPrice}
        onChangeMaxPrice={setMaxPrice}
        minRating={minRating}
        onSelectMinRating={setMinRating}
        onlyDeals={onlyDeals}
        onToggleDeals={() => setOnlyDeals(!onlyDeals)}
        inStockOnly={inStockOnly}
        onToggleInStock={() => setInStockOnly(!inStockOnly)}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

function ShopPageInner() {
  const searchParams = useSearchParams();
  const key = searchParams.toString();
  return <ShopContent key={key} searchParams={searchParams} />;
}

export function ShopPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Marketplace Catalog...</div>}>
      <ShopPageInner />
    </Suspense>
  );
}
