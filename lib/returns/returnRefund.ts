/**
 * @file lib/returns/returnRefund.ts
 * @description Pure shared functions for computing return item line totals, refund amounts for status changes, and shipping resolution.
 */

import { getItemLineTotal } from '@/lib/itemPrice';

export function sumReturnItems(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  let sum = 0;
  for (const item of items) {
    const lineTotal = getItemLineTotal(item);
    if (Number.isFinite(lineTotal) && lineTotal > 0) {
      sum += lineTotal;
    }
  }
  return sum;
}

export function computeRefundForStatus(doc: any, status: string): number {
  if (status === 'Rejected') {
    return 0;
  }
  const subtotal = Number.isFinite(Number(doc?.refundSubtotal))
    ? Number(doc.refundSubtotal)
    : sumReturnItems(doc?.items);

  let deduction = 0;
  if (doc?.shippingReview !== 'waived') {
    deduction = Number.isFinite(Number(doc?.shippingDeduction))
      ? Number(doc.shippingDeduction)
      : (Number.isFinite(Number(doc?.potentialShippingDeduction)) ? Number(doc.potentialShippingDeduction) : 0);
  }

  const refund = Math.max(0, subtotal - deduction);
  return Number.isFinite(refund) ? refund : 0;
}

export function computeShippingResolution(
  doc: any,
  decision: 'waived' | 'applied'
): {
  shippingReview: 'waived' | 'applied';
  shippingDeduction: number;
  refundTotal: number;
  refundSubtotal: number;
} {
  const subtotal = Number.isFinite(Number(doc?.refundSubtotal))
    ? Number(doc.refundSubtotal)
    : (sumReturnItems(doc?.items) || 0);

  const potential = Number.isFinite(Number(doc?.potentialShippingDeduction))
    ? Number(doc.potentialShippingDeduction)
    : 0;

  const shippingDeduction = decision === 'waived' ? 0 : potential;
  const refundTotal = Math.max(0, subtotal - shippingDeduction);

  return {
    shippingReview: decision,
    shippingDeduction: Number.isFinite(shippingDeduction) ? shippingDeduction : 0,
    refundTotal: Number.isFinite(refundTotal) ? refundTotal : 0,
    refundSubtotal: Number.isFinite(subtotal) ? subtotal : 0,
  };
}
