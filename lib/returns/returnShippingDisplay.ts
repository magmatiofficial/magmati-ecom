/**
 * @file lib/returns/returnShippingDisplay.ts
 * @description Customer-facing shipping deduction and net refund display logic for a return request.
 */

import type { ReturnRequest } from '@/store/useReturnStore';
import { getItemLineTotal } from '@/lib/itemPrice';

export function getReturnShippingDisplay(req: ReturnRequest) {
  const prodSubtotal = req.items?.reduce((s, i) => s + getItemLineTotal(i), 0) || (req.refundSubtotal ?? 0);

  if (req.status === 'Rejected') {
    return {
      type: 'rejected' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: 0,
      note: 'রিটার্ন বাতিল করা হয়েছে, কোনো রিফান্ড নেই',
    };
  }

  if (req.shippingReview === 'applied') {
    const deduction = typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0
      ? req.shippingDeduction
      : (req.potentialShippingDeduction || 0);
    const netRefund = typeof req.refundTotal === 'number' ? req.refundTotal : Math.max(0, prodSubtotal - deduction);
    return {
      type: 'applied' as const,
      deduction,
      subtotal: prodSubtotal,
      netRefund,
      note: 'শিপিং চার্জ কাটা হয়েছে',
    };
  }

  if (req.shippingReview === 'waived') {
    return {
      type: 'waived' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: typeof req.refundTotal === 'number' ? req.refundTotal : prodSubtotal,
      note: 'শিপিং চার্জ মওকুফ করা হয়েছে (আমরা বহন করেছি)',
    };
  }

  if (req.shippingReview === 'pending') {
    return {
      type: 'pending' as const,
      deduction: 0,
      subtotal: prodSubtotal,
      netRefund: prodSubtotal,
      note: 'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.',
    };
  }

  // Fallback for old records where shippingReview is missing
  const isMindChange = (req.reason || '').toLowerCase().includes('mind') || (req.reason || '').toLowerCase().includes('changed');
  const deduction = (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0)
    ? req.shippingDeduction
    : (isMindChange ? (req.potentialShippingDeduction || 0) : 0);
  const netRefund = typeof req.refundTotal === 'number' ? req.refundTotal : Math.max(0, prodSubtotal - deduction);

  return {
    type: isMindChange ? ('applied' as const) : ('pending' as const),
    deduction,
    subtotal: prodSubtotal,
    netRefund,
    note: isMindChange
      ? 'শিপিং চার্জ কাটা হয়েছে'
      : 'Pending Review: if our team finds no problem with the product, the delivery charge will be deducted.',
  };
}
