/**
 * @file lib/api/adminGuard.ts
 * @description Admin authentication, database availability, and rate limiting guards for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { rateLimit } from '@/lib/rateLimit';

export interface AdminGuardOptions {
  rateKeyPrefix: string;
  limit: number;
  windowMs: number;
}

export async function guardAdminOnly(
  req: NextRequest,
  opts: AdminGuardOptions
): Promise<
  | { ok: true; email: string }
  | { ok: false; response: NextResponse }
> {
  const adminCheck = await verifyAdminServerSide(req);
  if (!adminCheck.authorized) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: adminCheck.error || 'Unauthorized' },
        { status: adminCheck.status || 401 }
      ),
    };
  }

  const limiter = rateLimit(`${opts.rateKeyPrefix}:${adminCheck.email}`, opts.limit, opts.windowMs);
  if (!limiter.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Too many requests.' },
        { status: 429 }
      ),
    };
  }

  return {
    ok: true,
    email: adminCheck.email || '',
  };
}

export async function guardAdminRequest(
  req: NextRequest,
  opts: AdminGuardOptions
): Promise<
  | { ok: true; email: string; db: NonNullable<typeof adminDb> }
  | { ok: false; response: NextResponse }
> {
  const guardOnly = await guardAdminOnly(req, opts);
  if (!guardOnly.ok) {
    return guardOnly;
  }

  if (!adminDb) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      ),
    };
  }

  return {
    ok: true,
    email: guardOnly.email,
    db: adminDb,
  };
}
