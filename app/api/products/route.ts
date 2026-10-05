import { NextRequest, NextResponse } from "next/server";
import { products as masterProducts } from "@/data/products";
import { Product } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12', 10)));
    const category = searchParams.get('category') || 'All';
    const q = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();
    const deals = searchParams.get('deals') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const freeShipping = searchParams.get('freeShipping') === 'true';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const size = searchParams.get('size') || 'All';
    const color = searchParams.get('color') || 'All';
    const brand = searchParams.get('brand') || 'All';
    const sortBy = searchParams.get('sortBy') || 'featured';

    let filtered: Product[] = masterProducts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (deals && !p.isFlashDeal && !p.isBestDeal && !p.originalPrice) return false;
      if (inStock && (!p.inStock || (p.stockQuantity !== undefined && p.stockQuantity <= 0))) return false;
      if (freeShipping && p.price < 3500) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      if (p.price > maxPrice) return false;
      if (size !== 'All' && !p.sizes.includes(size)) return false;
      if (color !== 'All' && !p.colors?.some((c) => c.name === color)) return false;
      if (brand !== 'All' && p.brand !== brand) return false;
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSub = p.subcategory.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchSub && !matchBrand) return false;
      }
      return true;
    });

    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < total;

    return NextResponse.json({
      success: true,
      products: paginatedItems,
      total,
      page,
      limit,
      hasMore,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
