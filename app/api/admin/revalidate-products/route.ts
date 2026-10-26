import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { guardAdminOnly } from '@/lib/api/adminGuard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const guard = await guardAdminOnly(req, { rateKeyPrefix: 'admin_revalidate', limit: 60, windowMs: 60000 });
    if (!guard.ok) {
      return guard.response;
    }
    let scope = 'all';
    try {
      const body = await req.json();
      if (body && (body.scope === 'products' || body.scope === 'storefront')) {
        scope = body.scope;
      }
    } catch {
      /* no body: keep 'all' */
    }
    if (scope !== 'storefront') revalidateTag('products');
    if (scope !== 'products') revalidateTag('storefront');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
