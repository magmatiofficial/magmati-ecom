import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/serverProducts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getProducts();
  const cacheControl =
    products.length > 0
      ? 'public, s-maxage=60, stale-while-revalidate=300'
      : 'no-store';
  return NextResponse.json({ success: true, products }, { headers: { 'Cache-Control': cacheControl } });
}
