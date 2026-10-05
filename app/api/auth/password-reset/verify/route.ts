import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_VERIFY_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`pw_reset_ver:${clientIp}`, 10, 15 * 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { email, resetCode, newPassword } = await req.json();
    const emailLower = (email || '').toLowerCase().trim();
    const codeClean = (resetCode || '').toString().trim();

    if (!emailLower || !codeClean || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { success: false, error: 'Authentication service unavailable.' },
        { status: 500 }
      );
    }

    const inputHash = crypto.createHash('sha256').update(codeClean).digest('hex');
    const userRef = adminDb.collection('users').doc(emailLower);
    
    // 1. Atomic Transaction to check attempts, verify hash, enforce expiry, and invalidate reset code
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User account not found.');
      }

      const userData = userDoc.data() || {};
      const storedHash = userData.resetCodeHash;
      const legacyCode = userData.resetCode;
      const expiresAt = Number(userData.resetCodeExpiresAt);
      const currentAttempts = Number(userData.resetCodeAttempts || 0);

      if ((!storedHash && !legacyCode) || !expiresAt) {
        throw new Error('No active password reset code found. Please request a new code.');
      }

      if (Date.now() > expiresAt) {
        // Expired -> Invalidate
        transaction.update(userRef, {
          resetCodeHash: null,
          resetCode: null,
          resetCodeExpiresAt: null,
          resetCodeAttempts: null,
        });
        throw new Error('Verification code has expired. Please request a new code.');
      }

      if (currentAttempts >= MAX_VERIFY_ATTEMPTS) {
        // Exceeded maximum attempts -> Invalidate immediately
        transaction.update(userRef, {
          resetCodeHash: null,
          resetCode: null,
          resetCodeExpiresAt: null,
          resetCodeAttempts: null,
        });
        throw new Error('Maximum verification attempts exceeded. This code has been invalidated. Please request a new code.');
      }

      // Check match against SHA-256 hash or legacy plaintext
      const isMatched = storedHash === inputHash || (legacyCode && legacyCode.toString().trim() === codeClean);

      if (!isMatched) {
        const nextAttempts = currentAttempts + 1;
        const attemptsLeft = MAX_VERIFY_ATTEMPTS - nextAttempts;

        if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
          transaction.update(userRef, {
            resetCodeHash: null,
            resetCode: null,
            resetCodeExpiresAt: null,
            resetCodeAttempts: null,
          });
          throw new Error('Incorrect code. Maximum attempts reached. Code has been invalidated.');
        } else {
          transaction.update(userRef, {
            resetCodeAttempts: nextAttempts,
          });
          throw new Error(`Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`);
        }
      }

      // Match verified! Invalidate reset code (single-use)
      transaction.update(userRef, {
        resetCodeHash: null,
        resetCode: null,
        resetCodeExpiresAt: null,
        resetCodeAttempts: null,
        updatedAt: new Date().toISOString(),
      });
    });

    // 2. Authoritative Password Update in Firebase Authentication (Must not fail silently)
    try {
      const userRecord = await adminAuth.getUserByEmail(emailLower);
      if (userRecord?.uid) {
        await adminAuth.updateUser(userRecord.uid, { password: newPassword });
      }
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/user-not-found') {
        try {
          await adminAuth.createUser({ email: emailLower, password: newPassword });
        } catch (createErr: any) {
          return NextResponse.json(
            { success: false, error: 'Failed to update authentication credentials: ' + (createErr.message || 'Auth error') },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to update authentication credentials: ' + (fbErr.message || 'Auth error') },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify password reset code.' },
      { status: 400 }
    );
  }
}
