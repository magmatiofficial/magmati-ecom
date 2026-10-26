import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import firebaseConfigRaw from '../firebase-applet-config.json';
import { type AppletFirebaseConfig } from './firebase';

const firebaseConfig = firebaseConfigRaw as AppletFirebaseConfig;


export interface AdminAuthResult {
  authorized: boolean;
  email?: string;
  error?: string;
  status?: number;
}

/**
 * Server-side authorization check for Admin API routes.
 * Enforces server-side authentication and role verification before allowing access.
 */
export async function verifyAdminServerSide(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      if (!process.env.ADMIN_EMAILS) {
        console.warn("ADMIN_EMAILS not set");
      }
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      // 1. Try Firebase Admin SDK Token Verification
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded?.email) {
            const email = decoded.email.toLowerCase();
            const signInProvider = decoded.firebase?.sign_in_provider;
            const isEmailVerified = decoded.email_verified === true;
            const isGoogle = signInProvider === 'google.com';
            const isStrictVerified = isEmailVerified || isGoogle;
            const isInAdminEmails = adminEmails.includes(email);

            // Password login alone does NOT prove email ownership, so verification is required even for ADMIN_EMAILS.
            if (isInAdminEmails && isStrictVerified) {
              return { authorized: true, email };
            }

            // Firestore users/{email}.role === 'admin' strictly requires verified email or google.com
            if (isStrictVerified && adminDb) {
              try {
                const userSnap = await adminDb.collection('users').doc(email).get();
                if (userSnap.exists && userSnap.data()?.role === 'admin') {
                  return { authorized: true, email };
                }
              } catch (dbErr: unknown) {
                const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
                console.error('[ServerAuth] Firestore admin check error:', dbErrMsg);
              }
            }
          }
        } catch {
          // Fallback to Google Identity Toolkit endpoint
        }
      }

      // 2. Google Identity Toolkit API Verification
      try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey;
        if (apiKey) {
          const googleRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          });

          if (googleRes.ok) {
            const data = await googleRes.json();
            const user = data.users?.[0];
            if (user?.email) {
              const email = user.email.toLowerCase();
              const isEmailVerified = user.emailVerified === true;
              const isGoogle = user.providerUserInfo?.some((p: { providerId: string }) => p.providerId === 'google.com');
              const isStrictVerified = isEmailVerified || isGoogle;
              const isInAdminEmails = adminEmails.includes(email);

              // Password login alone does NOT prove email ownership, so verification is required even for ADMIN_EMAILS.
              if (isInAdminEmails && isStrictVerified) {
                return { authorized: true, email };
              }

              // Firestore role check strictly requires verified email or google.com
              if (isStrictVerified) {
                if (adminDb) {
                  try {
                    const userSnap = await adminDb.collection('users').doc(email).get();
                    if (userSnap.exists && userSnap.data()?.role === 'admin') {
                      return { authorized: true, email };
                    }
                  } catch (dbErr: unknown) {
                    const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
                    console.error('[ServerAuthFallback] Firestore admin check error:', dbErrMsg);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Firebase server token verification notice:', err);
      }
    }
  }

  return {
    authorized: false,
    error: 'Unauthorized: Server-side admin authentication and token authorization required.',
    status: 401,
  };
}
