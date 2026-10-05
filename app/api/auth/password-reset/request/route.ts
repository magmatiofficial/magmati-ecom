import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendServerEmail, sendServerSms } from '@/lib/serverNotifications';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { escapeHtml } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const isAllowed = rateLimit(`pw_reset_req:${clientIp}`, 5, 15 * 60 * 1000);
  if (!isAllowed.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();
    const emailLower = (email || '').toLowerCase().trim();

    if (!emailLower || !emailLower.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 500 }
      );
    }

    const userRef = adminDb.collection('users').doc(emailLower);
    const userSnap = await userRef.get();

    // Prevent user enumeration: respond with success even if account doesn't exist
    if (!userSnap.exists) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification code has been dispatched.',
      });
    }

    const userData = userSnap.data() || {};
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeHash = crypto.createHash('sha256').update(resetCode).digest('hex');
    const resetCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store only the secure hash and reset attempt counter (not plaintext)
    await userRef.update({
      resetCodeHash,
      resetCode: null, // Wipe any legacy plaintext code
      resetCodeExpiresAt,
      resetCodeAttempts: 0,
      updatedAt: new Date().toISOString(),
    });

    // Dispatch secure server-side OTP email
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #D12929; margin: 0; font-size: 22px;">MAGMATI Lifestyle</h2>
          <p style="color: #71717a; font-size: 13px; margin: 4px 0 0;">Password Reset Verification Code</p>
        </div>
        <p style="font-size: 14px; color: #18181b;">Hello <strong>${escapeHtml(userData.name || 'Valued Customer')}</strong>,</p>
        <p style="font-size: 14px; color: #52525b; line-height: 1.5;">We received a request to reset your MAGMATI account password. Please use the 6-digit verification code below to complete your reset:</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #D12929; background-color: #fef2f2; padding: 12px 28px; border-radius: 12px; border: 1px dashed #fca5a5;">
            ${escapeHtml(resetCode)}
          </div>
        </div>
        <p style="font-size: 12px; color: #a1a1aa; text-align: center;">This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;

    await sendServerEmail({
      to: emailLower,
      subject: 'Your MAGMATI Password Reset Verification Code',
      html: emailHtml,
      text: `Your MAGMATI verification code is: ${resetCode}. Valid for 10 minutes.`,
    });

    if (userData.phone) {
      await sendServerSms({
        phone: userData.phone,
        message: `Your MAGMATI password reset code is: ${resetCode}. Valid for 10 minutes. Do not share this code with anyone.`,
        type: 'otp_verification',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully.',
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
