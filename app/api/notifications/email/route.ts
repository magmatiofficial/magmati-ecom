import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminServerSide } from '@/lib/serverAuth';
import { sendServerEmail } from '@/lib/serverNotifications';

interface EmailRequestBody {
  to: string;
  subject: string;
  html?: string;
  text?: string;
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

    const body: EmailRequestBody = await req.json();
    const { to, subject, html, text, orderId } = body;

    if (!to || (!html && !text)) {
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'Recipient email address or content was missing.',
      }, { status: 400 });
    }

    const result = await sendServerEmail({ to, subject, html, text, orderId });

    return NextResponse.json({
      success: result.success,
      skipped: result.skipped,
      reason: result.reason,
      recipient: to,
    }, { status: 200 });
  } catch (error: any) {
    console.warn('Admin email route handled error safely:', error?.message);
    return NextResponse.json({
      success: false,
      safeFail: true,
      error: error?.message || 'Failed to dispatch email.',
    }, { status: 500 });
  }
}
