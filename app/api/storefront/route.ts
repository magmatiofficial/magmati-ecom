import { NextResponse } from 'next/server';
import { getStorefrontData } from '@/lib/serverStorefront';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getStorefrontData();

  if (!data) {
    return NextResponse.json(
      { success: false },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { success: true, ...data },
    { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' } }
  );
}
