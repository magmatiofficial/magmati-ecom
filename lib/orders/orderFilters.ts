/**
 * @file lib/orders/orderFilters.ts
 * @description Order status and payment status constants, type guards, filtering helpers, and phone query normalisation.
 */

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Dispatched', 'Delivered', 'Cancelled'] as const;
export const PAYMENT_STATUSES = ['cod_due', 'awaiting_verification', 'awaiting_gateway', 'paid', 'failed'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function statusFilterValues(status: string): string[] {
  if (status === 'Shipped') {
    return ['Shipped', 'Dispatched'];
  }
  return [status];
}

export function matchesStatusFilter(orderStatus: string | undefined, filter: string): boolean {
  if (!orderStatus) return false;
  if (filter === 'Shipped') {
    return orderStatus === 'Shipped' || orderStatus === 'Dispatched';
  }
  return orderStatus === filter;
}

export function normalizePhoneQuery(input: string): string {
  let digits = input.replace(/[\s-+]/g, '');
  if (digits.startsWith('88') && digits.length >= 12) {
    digits = digits.slice(2);
  }
  return digits;
}
