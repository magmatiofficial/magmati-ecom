import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * @api {post} /api/auth/sync-role Sync User Role
 * @description Verifies the Firebase ID token and returns the authoritative role from the server.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  
  // Rate limit: 20 requests per minute per IP for role syncing
  const limitResult = rateLimit(`sync_role:${clientIp}`, 20, 60 * 1000);
  if (!limitResult.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 401 });
  }

  try {
    // 1. Verify token with Firebase Admin SDK
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const email = decoded.email.toLowerCase();
    let role: 'admin' | 'customer' = 'customer';
    let reason:
      | 'admin_env_match'
      | 'admin_env_match_password_unverified'
      | 'admin_firestore_role'
      | 'not_verified'
      | 'not_in_env_and_db_unavailable'
      | 'not_in_env_and_not_admin_in_db'
      | 'env_missing' = 'not_verified';

    const signInProvider = decoded.firebase?.sign_in_provider;
    const isEmailVerified = decoded.email_verified === true;
    const isGoogle = signInProvider === 'google.com';
    const isPassword = signInProvider === 'password';
    const isStrictVerified = isEmailVerified || isGoogle;

    const rawEnv = process.env.ADMIN_EMAILS;
    const isEnvSet = typeof rawEnv === 'string' && rawEnv.trim().length > 0;
    const adminEmails = (rawEnv || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isInAdminEmails = adminEmails.includes(email);

    // Admin role policy:
    // Grant admin if email is in ADMIN_EMAILS AND (email is verified OR provider is google.com OR provider is password).
    // Admin accounts in ADMIN_EMAILS using password login may have unverified email, but valid password credentials prove ownership.
    // The Firestore users/{email}.role === 'admin' path strictly requires verified email or google.com.
    // Anonymous or any other provider never gets admin.
    if (isInAdminEmails && (isStrictVerified || isPassword)) {
      role = 'admin';
      reason = isStrictVerified ? 'admin_env_match' : 'admin_env_match_password_unverified';
    } else if (isStrictVerified) {
      if (!adminDb) {
        role = 'customer';
        reason = isEnvSet ? 'not_in_env_and_db_unavailable' : 'env_missing';
      } else {
        try {
          const userSnap = await adminDb.collection('users').doc(email).get();
          if (userSnap.exists && userSnap.data()?.role === 'admin') {
            role = 'admin';
            reason = 'admin_firestore_role';
          } else {
            role = 'customer';
            reason = isEnvSet ? 'not_in_env_and_not_admin_in_db' : 'env_missing';
          }
        } catch (dbErr: any) {
          console.error('[SyncRole] Firestore role lookup error:', dbErr.message || dbErr);
          role = 'customer';
          reason = isEnvSet ? 'not_in_env_and_db_unavailable' : 'env_missing';
        }
      }
    } else {
      role = 'customer';
      reason = 'not_verified';
    }

    // Server-side audit log (no secrets or tokens logged)
    console.log('[SyncRole Decision]', { role, reason });

    const responsePayload: { role: string; reason?: string } = { role };
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.reason = reason;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Role sync error:', error);
    return NextResponse.json(
      { error: 'Token verification failed', details: error.message },
      { status: 401 }
    );
  }
}
