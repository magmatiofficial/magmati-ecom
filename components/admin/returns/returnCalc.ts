/**
 * @file returnCalc.ts
 * @description Helper functions for return shipping details and refund calculations.
 */

import { ReturnRequest } from '@/store/useReturnStore';
import { getItemLineTotal } from '@/lib/itemPrice';

export function getReturnShippingDetails(req: ReturnRequest) {
  const subtotal = req.items?.reduce((sum, item) => sum + getItemLineTotal(item), 0) || 0;
    
  if (req.status === 'Rejected') {
    return { subtotal, fee: 0, isDeducted: false, netRefund: 0 };
  }

  let fee = 0;
  if (req.shippingReview === 'waived' || req.shippingReview === 'pending') {
    fee = 0;
  } else if (req.shippingReview === 'applied') {
    fee = (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0)
      ? req.shippingDeduction 
      : (req.potentialShippingDeduction || 0);
  } else if (typeof req.shippingDeduction === 'number' && req.shippingDeduction > 0) {
    // Fallback for legacy or undefined review status
    fee = req.shippingDeduction;
  }

  const netRefund = Math.max(0, subtotal - fee);
  return { subtotal, fee, isDeducted: true, netRefund };
}

export function calculateReturnTotalRefund(req: ReturnRequest) {
  return getReturnShippingDetails(req).netRefund;
}
