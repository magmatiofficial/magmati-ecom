import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebaseAdmin';
import { escapeHtml } from '@/lib/utils';

export interface SendServerEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  orderId?: string;
}

export interface SendServerSmsOptions {
  phone: string;
  message: string;
  orderId?: string;
  type?: 'order_placed' | 'status_change' | 'otp_verification' | 'test_message';
}

/**
 * Server-only helper to send emails safely using configured environment variables or Firestore credentials.
 */
export async function sendServerEmail(options: SendServerEmailOptions): Promise<{ success: boolean; skipped?: boolean; error?: string; reason?: string }> {
  try {
    const { to, subject, html, text, orderId } = options;
    if (!to || (!html && !text)) {
      return { success: false, skipped: true, reason: 'Missing recipient or content.' };
    }

    let isEnabled = process.env.EMAIL_ENABLED === 'true';
    let provider = process.env.EMAIL_PROVIDER || 'resend';
    let apiKey = process.env.EMAIL_API_KEY || '';
    let smtpHost = process.env.SMTP_HOST || '';
    let smtpPort = process.env.SMTP_PORT || '587';
    let smtpUser = process.env.SMTP_USER || '';
    let smtpPass = process.env.SMTP_PASS || '';
    let fromAddress = process.env.EMAIL_FROM_ADDRESS || 'orders@magmati.com';
    let fromName = process.env.EMAIL_FROM_NAME || 'MAGMATI Lifestyle';

    if (adminDb) {
      try {
        const envSnap = await adminDb.collection('site_settings').doc('env_credentials').get();
        if (envSnap.exists) {
          const envData = envSnap.data() || {};
          if (envData.EMAIL_ENABLED !== undefined) {
            isEnabled = envData.EMAIL_ENABLED === 'true' || envData.EMAIL_ENABLED === true;
          }
          if (envData.EMAIL_PROVIDER) provider = envData.EMAIL_PROVIDER;
          if (envData.EMAIL_API_KEY) apiKey = envData.EMAIL_API_KEY;
          if (envData.SMTP_HOST) smtpHost = envData.SMTP_HOST;
          if (envData.SMTP_PORT) smtpPort = envData.SMTP_PORT;
          if (envData.SMTP_USER) smtpUser = envData.SMTP_USER;
          if (envData.SMTP_PASS) smtpPass = envData.SMTP_PASS;
          if (envData.EMAIL_FROM_ADDRESS) fromAddress = envData.EMAIL_FROM_ADDRESS;
          if (envData.EMAIL_FROM_NAME) fromName = envData.EMAIL_FROM_NAME;
        }
      } catch {
        // Safe fallback
      }
    }

    if (!isEnabled) {
      return { success: true, skipped: true, reason: 'Email notification service disabled.' };
    }

    const senderFull = `${fromName} <${fromAddress}>`;

    if (provider === 'resend' && apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderFull,
          to: [to],
          subject,
          html: html || `<p>${escapeHtml(text)}</p>`,
          text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      return { success: res.ok };
    }

    if (provider === 'sendgrid' && apiKey) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromAddress, name: fromName },
          subject,
          content: [{ type: html ? 'text/html' : 'text/plain', value: html || text || '' }],
        }),
        signal: AbortSignal.timeout(8000),
      });
      return { success: res.ok };
    }

    if (provider === 'nodemailer' && smtpHost && smtpUser && smtpPass) {
      const portNum = Number(smtpPort) || 587;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: portNum,
        secure: portNum === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: senderFull,
        to,
        subject,
        html: html || `<p>${escapeHtml(text)}</p>`,
        text,
      });
      return { success: true };
    }

    return { success: true, skipped: true, reason: 'No active email provider configured.' };
  } catch (err: any) {
    console.warn('sendServerEmail safe notice:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Server-only helper to send SMS safely using configured environment variables or Firestore credentials.
 */
export async function sendServerSms(options: SendServerSmsOptions): Promise<{ success: boolean; skipped?: boolean; error?: string; reason?: string }> {
  try {
    const { phone, message, orderId, type = 'order_placed' } = options;
    if (!phone || !message) {
      return { success: false, skipped: true, reason: 'Missing phone or message.' };
    }

    let isEnabled = process.env.SMS_ENABLED === 'true';
    let provider = process.env.SMS_PROVIDER || 'greenweb';
    let apiKey = process.env.SMS_API_KEY || '';
    let senderId = process.env.SMS_SENDER_ID || 'MAGMATI';
    let clientId = process.env.SMS_CLIENT_ID || '';
    let customEndpoint = process.env.SMS_CUSTOM_ENDPOINT || '';

    if (adminDb) {
      try {
        const envSnap = await adminDb.collection('site_settings').doc('env_credentials').get();
        if (envSnap.exists) {
          const envData = envSnap.data() || {};
          if (envData.SMS_API_KEY) {
            apiKey = envData.SMS_API_KEY;
            isEnabled = envData.SMS_ENABLED === 'true' || envData.SMS_ENABLED === true || isEnabled;
            provider = envData.SMS_PROVIDER || provider;
            senderId = envData.SMS_SENDER_ID || senderId;
            clientId = envData.SMS_CLIENT_ID || clientId;
          }
        }
      } catch {
        // Safe fallback
      }
    }

    if (!isEnabled || !apiKey || apiKey.trim() === '') {
      return { success: true, skipped: true, reason: 'SMS service disabled or not configured.' };
    }

    let formattedPhone = phone.replace(/[^\d+]/g, '');
    if (formattedPhone.startsWith('+88')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('01')) {
      formattedPhone = '88' + formattedPhone;
    }

    if (provider === 'greenweb') {
      const url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(formattedPhone)}&message=${encodeURIComponent(message)}`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      return { success: text.includes('Ok') || text.includes('100') };
    }

    if (provider === 'bulksmsbd') {
      const url = `http://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(apiKey)}&type=text&number=${encodeURIComponent(formattedPhone)}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(message)}`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
      const data = await res.json().catch(() => ({}));
      return { success: data?.response_code === 202 };
    }

    if (provider === 'sslwireless') {
      const url = 'https://smsplus.sslwireless.com/api/v3/send-sms';
      const payload = {
        api_token: apiKey,
        sid: senderId,
        msisdn: formattedPhone,
        sms: message,
        csms_id: orderId || `csms_${Date.now()}`
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json().catch(() => ({}));
      return { success: data?.status === 'SUCCESS' };
    }

    return { success: true, skipped: true, reason: `Provider ${provider} not configured.` };
  } catch (err: any) {
    console.warn('sendServerSms safe notice:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Server-side order placed notification trigger
 */
export async function dispatchServerOrderPlacedNotification(order: { id: string; userName: string; phone: string; userEmail?: string; total: number }) {
  try {
    const smsMsg = `Dear ${order.userName || 'Customer'}, thank you for shopping with MAGMATI! Your order #${order.id} for ৳${order.total} has been confirmed. Helpline: 01700000000`;
    if (order.phone) {
      await sendServerSms({
        phone: order.phone,
        message: smsMsg,
        orderId: order.id,
        type: 'order_placed',
      });
    }

    if (order.userEmail && order.userEmail.trim()) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #D12929;">MAGMATI Lifestyle - Order Confirmation</h2>
          <p>Dear <strong>${escapeHtml(order.userName || 'Valued Customer')}</strong>,</p>
          <p>Your order <strong>#${escapeHtml(order.id)}</strong> has been placed successfully.</p>
          <p>Total Payable: <strong>৳${escapeHtml(order.total)}</strong></p>
          <p>Thank you for choosing MAGMATI Lifestyle.</p>
        </div>
      `;
      await sendServerEmail({
        to: order.userEmail.trim(),
        subject: `Order Confirmation #${order.id} - MAGMATI Lifestyle`,
        html: emailHtml,
        orderId: order.id,
      });
    }
  } catch (err) {
    console.warn('dispatchServerOrderPlacedNotification notice:', err);
  }
}

/**
 * Server-side status change notification trigger
 */
export async function dispatchServerOrderStatusNotification(order: { id: string; userName: string; phone: string; userEmail?: string; status: string }, newStatus: string) {
  try {
    const smsMsg = `Hello ${order.userName || 'Customer'}, your MAGMATI order #${order.id} status has been updated to: ${newStatus}. Track online anytime. Helpline: 01700000000`;
    if (order.phone) {
      await sendServerSms({
        phone: order.phone,
        message: smsMsg,
        orderId: order.id,
        type: 'status_change',
      });
    }

    if (order.userEmail && order.userEmail.trim()) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #D12929;">MAGMATI Order Status Update</h2>
          <p>Dear <strong>${escapeHtml(order.userName || 'Customer')}</strong>,</p>
          <p>Your order <strong>#${escapeHtml(order.id)}</strong> is now <strong>${escapeHtml(newStatus)}</strong>.</p>
        </div>
      `;
      await sendServerEmail({
        to: order.userEmail.trim(),
        subject: `Order #${order.id} Status Update: ${newStatus}`,
        html: emailHtml,
        orderId: order.id,
      });
    }
  } catch (err) {
    console.warn('dispatchServerOrderStatusNotification notice:', err);
  }
}
