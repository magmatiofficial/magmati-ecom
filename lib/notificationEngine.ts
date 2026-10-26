'use client';

import { useNotificationLogStore, NotificationSettings } from '@/store/useNotificationLogStore';
import { Order } from '@/store/useOrderStore';
import { auth } from '@/lib/firebase';
import { escapeHtml } from '@/lib/utils';

export const EMAIL_COLORS = {
  primary: '#D12929',
  dark: '#18181B',
  bg: '#F4F4F5',
  border: '#E4E4E7',
  muted: '#71717A',
  success: '#166534',
  successBg: '#F0FDF4',
} as const;

/**
 * Clean & resilient notification engine for MAGMATI Lifestyle
 * Designed to NEVER throw uncaught exceptions or interrupt the user experience.
 */

export function generateOrderSmsMessage(order: Order, appName = 'MAGMATI'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `Thank you ${order.userName}! Your order #${order.id} has been received at ${appName}. Total: ৳${order.total}. Track your package: ${origin}/track?id=${order.id}`;
}

export function generateStatusSmsMessage(order: Order, statusText: string, appName = 'MAGMATI'): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `Dear ${order.userName}, your order #${order.id} status at ${appName} is now: ${statusText}. Tracking link: ${origin}/track?id=${order.id}`;
}

export function generateOtpSmsMessage(otp: string, appName = 'MAGMATI'): string {
  return `Your ${appName} verification OTP code is: ${otp}. Do not share this code with anyone.`;
}

export function generateOrderEmailHtml(order: Order, appName = 'MAGMATI Lifestyle'): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">
        <strong style="color: #18181b; font-size: 13px;">${escapeHtml(item.product?.name)}</strong>
        <div style="font-size: 11px; color: #71717a;">Size: ${escapeHtml(item.selectedSize || 'Standard')} | Qty: ${escapeHtml(item.quantity)}</div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; text-align: right; color: #18181b; font-weight: bold; font-size: 13px;">
        ৳${Math.round((item.product?.price || 0) * (item.quantity || 1)).toLocaleString('en-US')}
      </td>
    </tr>
  `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation - ${escapeHtml(appName)}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #18181b; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(appName)}</h1>
        <p style="margin: 6px 0 0; font-size: 12px; color: #a1a1aa;">Order Successfully Placed</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #166534; margin: 0; font-size: 16px;">Thank You, ${escapeHtml(order.userName)}!</h2>
          <p style="color: #15803d; margin: 4px 0 0; font-size: 12px;">Your Order ID: <strong>#${escapeHtml(order.id)}</strong></p>
        </div>

        <h3 style="font-size: 14px; color: #18181b; margin-top: 0; border-bottom: 2px solid #f4f4f5; padding-bottom: 8px;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px 0; color: #71717a; font-size: 13px;">Delivery Fee:</td>
            <td style="padding: 10px 0; text-align: right; color: #18181b; font-size: 13px;">৳${escapeHtml(order.deliveryFee || 0)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-size: 15px; font-weight: bold; color: #18181b;">Grand Total:</td>
            <td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: bold; color: #dc2626;">৳${escapeHtml(order.total)}</td>
          </tr>
        </table>

        <div style="background-color: #fafafa; border-radius: 10px; padding: 12px; font-size: 12px; color: #52525b; margin-bottom: 24px;">
          <p style="margin: 0 0 4px;"><strong>Shipping Address:</strong> ${escapeHtml(order.address)}${order.district ? `, ${escapeHtml(order.district)}` : ''}</p>
          <p style="margin: 0 0 4px;"><strong>Phone Number:</strong> ${escapeHtml(order.phone)}</p>
          <p style="margin: 0;"><strong>Payment Method:</strong> ${escapeHtml(order.payment)}</p>
        </div>

        <div style="text-align: center;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/track?id=${encodeURIComponent(order.id)}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Track Order
          </a>
        </div>
      </div>

      <div style="background-color: #fafafa; border-top: 1px solid #e4e4e7; padding: 14px; text-align: center; font-size: 11px; color: #a1a1aa;">
        For assistance, please contact: support@magmati.com
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Dispatch safe order notification (SMS + Email)
 * Uses secure server-side database lookups.
 * Will NEVER fail the order or show alert errors to customer.
 */
export async function dispatchOrderNotifications(order: Order) {
  try {
    const store = useNotificationLogStore.getState();

    // 1. Process SMS via secure server API (which reads directly from Firestore DB)
    if (order.phone) {
      const smsMessage = generateOrderSmsMessage(order);
      fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: order.phone,
          message: smsMessage,
          type: 'order_placed',
          orderId: order.id,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.sent) {
            store.addLog({
              channel: 'sms',
              eventType: 'order_placed',
              recipient: order.phone,
              status: 'sent',
              provider: resData.provider || 'SMS Gateway',
              summary: `SMS confirmation sent to ${order.phone}`,
              details: `Provider status: ${resData.providerStatus || 'Delivered'}`,
              orderId: order.id,
            });
          } else {
            store.addLog({
              channel: 'sms',
              eventType: 'order_placed',
              recipient: order.phone,
              status: resData.skipped ? 'skipped' : 'failed',
              provider: resData.provider || 'SMS Gateway',
              summary: resData.reason || resData.error || 'SMS service in standby',
              details: 'Customer order succeeded cleanly without interruption.',
              orderId: order.id,
            });
          }
        })
        .catch((err) => {
          store.addLog({
            channel: 'sms',
            eventType: 'order_placed',
            recipient: order.phone,
            status: 'failed',
            provider: 'SMS Gateway',
            summary: 'Network timeout during SMS dispatch',
            details: err?.message || 'Handled gracefully',
            orderId: order.id,
          });
        });
    }

    // 2. Process Customer Email via secure server API (which reads directly from Firestore DB)
    if (order.userEmail) {
      const emailHtml = generateOrderEmailHtml(order);
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.userEmail,
          subject: `Order Confirmation: #${order.id} - MAGMATI Lifestyle`,
          html: emailHtml,
          type: 'order_placed',
          orderId: order.id,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.sent) {
            store.addLog({
              channel: 'email',
              eventType: 'order_placed',
              recipient: order.userEmail,
              status: 'sent',
              provider: resData.provider || 'Email Gateway',
              summary: `Invoice email delivered to ${order.userEmail}`,
              details: `Email ID: ${resData.id || 'Delivered'}`,
              orderId: order.id,
            });
          } else {
            store.addLog({
              channel: 'email',
              eventType: 'order_placed',
              recipient: order.userEmail,
              status: resData.skipped ? 'skipped' : 'failed',
              provider: resData.provider || 'Email Gateway',
              summary: resData.reason || resData.error || 'Email dispatch standby',
              details: 'Customer order succeeded cleanly.',
              orderId: order.id,
            });
          }
        })
        .catch((err) => {
          store.addLog({
            channel: 'email',
            eventType: 'order_placed',
            recipient: order.userEmail,
            status: 'failed',
            provider: 'Email Gateway',
            summary: 'Network timeout during Email dispatch',
            details: err?.message || 'Handled gracefully',
            orderId: order.id,
          });
        });
    }

  } catch (err: any) {
    console.warn('dispatchOrderNotifications safe catch:', err);
  }
}

/**
 * Dispatch order status change notification (e.g. Confirmed, Shipped, Delivered)
 */
export async function dispatchStatusNotification(order: Order, newStatus: string) {
  try {
    const store = useNotificationLogStore.getState();

    if (order.phone) {
      const msg = generateStatusSmsMessage(order, newStatus);
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch('/api/notifications/sms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: order.phone,
          message: msg,
          type: 'status_change',
          orderId: order.id,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          store.addLog({
            channel: 'sms',
            eventType: 'status_change',
            recipient: order.phone,
            status: resData.sent ? 'sent' : resData.skipped ? 'skipped' : 'failed',
            provider: resData.provider || 'SMS Gateway',
            summary: `Status updated to "${newStatus}" for #${order.id}`,
            details: resData.providerStatus || resData.reason || resData.error,
            orderId: order.id,
          });
        })
        .catch(() => {});
    }
  } catch (err) {
    console.warn('dispatchStatusNotification safe catch:', err);
  }
}

/**
 * Dispatch OTP verification code (SMS / Email)
 */
export async function dispatchOtpNotification(recipient: string, otp: string, channel: 'sms' | 'email') {
  try {
    const store = useNotificationLogStore.getState();

    if (channel === 'sms') {
      const msg = generateOtpSmsMessage(otp);
      fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recipient,
          message: msg,
          type: 'otp_verification',
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          store.addLog({
            channel: 'sms',
            eventType: 'otp_verification',
            recipient,
            status: resData.sent ? 'sent' : 'failed',
            provider: resData.provider || 'SMS Gateway',
            summary: `OTP code sent to ${recipient}`,
            details: resData.providerStatus || resData.error,
          });
        })
        .catch(() => {});
    }

    if (channel === 'email') {
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: 'Your MAGMATI Password Reset OTP Code',
          html: `<div style="padding:20px;font-family:sans-serif;text-align:center;"><h2>Password Reset Verification Code</h2><p style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#dc2626;">${escapeHtml(otp)}</p><p>This code will remain active for the next 10 minutes.</p></div>`,
          type: 'otp_verification',
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          store.addLog({
            channel: 'email',
            eventType: 'otp_verification',
            recipient,
            status: resData.sent ? 'sent' : 'failed',
            provider: resData.provider || 'Email Gateway',
            summary: `OTP email sent to ${recipient}`,
            details: resData.id || resData.error,
          });
        })
        .catch(() => {});
    }
  } catch (err) {
    console.warn('dispatchOtpNotification safe catch:', err);
  }
}
