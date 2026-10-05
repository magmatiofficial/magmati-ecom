import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { sendServerSms } from '@/lib/serverNotifications';

interface SmsRequestBody {
  phone: string;
  message: string;
  type?: 'order_placed' | 'status_change' | 'otp_verification' | 'test_message';
  orderId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAdminServerSide(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    const body: SmsRequestBody = await req.json();
    const { phone, message, type = 'test_message', orderId } = body;

    if (!phone || !message) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'Phone number or message content was missing.',
      }, { status: 400 });
    }

    const result = await sendServerSms({ phone, message, orderId, type });

    return NextResponse.json({
      success: result.success,
      skipped: result.skipped,
      reason: result.reason,
      phone,
    }, { status: 200 });
  } catch (error: any) {
    console.warn('Admin SMS route handled error safely:', error?.message);
    return NextResponse.json({
      success: false,
      safeFail: true,
      error: error?.message || 'Failed to dispatch SMS.',
    }, { status: 500 });
  }
}
