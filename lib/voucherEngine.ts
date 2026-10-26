/**
 * @file lib/voucherEngine.ts
 * @description Pure server-side & universal voucher evaluation engine.
 * Evaluates voucher rules deterministically against an order context without browser/React dependencies.
 */

export interface VoucherRule {
  id?: string;
  code: string;
  isActive: boolean;
  discountType: 'fixed' | 'percentage' | 'free_shipping';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  paymentMethodRequirement?: 'all' | 'bkash' | 'nagad' | 'card' | 'cod';
  applicableCategory?: string;
  requiresLogin?: boolean;
  expiresAt?: string;
  maxUsesPerCustomer?: number;
  maxDiscountSpendPerUser?: number;
  totalDiscountBudget?: number;
}

export interface VoucherEvaluationUsage {
  usedByUser?: number;
  accumulatedByUser?: number;
  totalUsedBudget?: number;
}

export interface VoucherEvaluationContext {
  subtotal: number;
  deliveryFee: number;
  paymentLabel?: string;
  categories: string[];
  userEmail?: string;
  usage?: VoucherEvaluationUsage;
}

export interface VoucherEvaluationResult {
  isValid: boolean;
  discountAmount: number;
  isFreeShipping: boolean;
  message: string;
}

/**
 * Pure evaluation function mirroring applyAndValidateVoucher from the client store.
 */
export function evaluateVoucher(
  voucher: VoucherRule,
  ctx: VoucherEvaluationContext
): VoucherEvaluationResult {
  if (!voucher.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      message: 'This voucher is currently inactive.',
    };
  }

  // Expiry check (Valid until 23:59:59.999 in Bangladesh time UTC+06:00)
  if (voucher.expiresAt) {
    const expiryStr = voucher.expiresAt.includes('T')
      ? voucher.expiresAt
      : `${voucher.expiresAt}T23:59:59.999+06:00`;
    const expiryDate = new Date(expiryStr);
    if (!isNaN(expiryDate.getTime()) && new Date() > expiryDate) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: 'This voucher has expired.',
      };
    }
  }

  const emailKey = ctx.userEmail && ctx.userEmail !== 'guest' ? ctx.userEmail.toLowerCase() : 'guest';
  const usedByUser = ctx.usage?.usedByUser ?? 0;
  const accumulatedByUser = ctx.usage?.accumulatedByUser ?? 0;
  const totalUsedBudget = ctx.usage?.totalUsedBudget ?? 0;

  // Check overall budget limit
  if (voucher.totalDiscountBudget && totalUsedBudget >= voucher.totalDiscountBudget) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      message: 'Campaign budget limit reached for this voucher.',
    };
  }

  // Check maximum uses per customer
  if (voucher.maxUsesPerCustomer && emailKey !== 'guest') {
    if (usedByUser >= voucher.maxUsesPerCustomer) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `You have reached the maximum use limit of (${voucher.maxUsesPerCustomer}) for this voucher.`,
      };
    }
  }

  // Check accumulated discount spend limit per customer
  if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
    if (accumulatedByUser >= voucher.maxDiscountSpendPerUser) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `You have reached the maximum accumulated discount limit of ৳${voucher.maxDiscountSpendPerUser} for this voucher.`,
      };
    }
  }

  if (voucher.discountType === 'free_shipping' && ctx.deliveryFee <= 0) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      message: `Delivery is already free for this order, so voucher ${voucher.code} is not needed.`,
    };
  }

  // Account requirement check (verified signed-in user on server)
  const hasPerCustomerLimit = (voucher.maxUsesPerCustomer ?? 0) > 0 || (voucher.maxDiscountSpendPerUser ?? 0) > 0;
  if (voucher.requiresLogin) {
    if (!ctx.userEmail || ctx.userEmail === 'guest') {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Voucher "${voucher.code}" requires an account. Please sign in to apply.`,
      };
    }
  }

  if (hasPerCustomerLimit) {
    if (!ctx.userEmail || ctx.userEmail === 'guest') {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Voucher "${voucher.code}" has a per-customer limit, so it requires an account. Please sign in to apply.`,
      };
    }
  }

  // Minimum spend check
  if (ctx.subtotal < voucher.minSpend) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      message: `Minimum order of ৳${voucher.minSpend.toLocaleString('en-US')} required for code ${voucher.code}.`,
    };
  }

  // Payment method requirement check
  if (voucher.paymentMethodRequirement && voucher.paymentMethodRequirement !== 'all' && ctx.paymentLabel) {
    const pm = ctx.paymentLabel.toLowerCase();
    if (voucher.paymentMethodRequirement === 'bkash' && !pm.includes('bkash')) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Code ${voucher.code} is valid only for bKash payment method.`,
      };
    }
    if (voucher.paymentMethodRequirement === 'nagad' && !pm.includes('nagad')) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Code ${voucher.code} is valid only for Nagad payment method.`,
      };
    }
    if (voucher.paymentMethodRequirement === 'cod' && !pm.includes('cash') && !pm.includes('delivery')) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Code ${voucher.code} is valid only for Cash on Delivery.`,
      };
    }
    if (voucher.paymentMethodRequirement === 'card' && !pm.includes('card')) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Code ${voucher.code} is valid only for Card payments.`,
      };
    }
  }

  // Applicable category check
  const activeCategories = ctx.categories;
  if (voucher.applicableCategory && voucher.applicableCategory.toLowerCase() !== 'all' && activeCategories && activeCategories.length > 0) {
    const match = activeCategories.some(
      (c) => c.toLowerCase().trim() === voucher.applicableCategory!.toLowerCase().trim()
    );
    if (!match) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Code ${voucher.code} is applicable only for products in "${voucher.applicableCategory}".`,
      };
    }
  }

  let discount = 0;
  let isFreeShip = false;

  if (voucher.discountType === 'fixed') {
    discount = Math.min(voucher.discountValue, ctx.subtotal);
  } else if (voucher.discountType === 'percentage') {
    const calculated = Math.round((ctx.subtotal * voucher.discountValue) / 100);
    discount = voucher.maxDiscount ? Math.min(calculated, voucher.maxDiscount) : calculated;
  } else if (voucher.discountType === 'free_shipping') {
    if (ctx.deliveryFee <= 0) {
      return {
        isValid: false,
        discountAmount: 0,
        isFreeShipping: false,
        message: `Delivery is already free for this order, so voucher ${voucher.code} is not needed.`,
      };
    }
    discount = ctx.deliveryFee;
    isFreeShip = true;
  }

  // Validate customer spend limit
  if (voucher.maxDiscountSpendPerUser && emailKey !== 'guest') {
    const spend = accumulatedByUser;
    if (spend + discount > voucher.maxDiscountSpendPerUser) {
      const allowedDiscount = voucher.maxDiscountSpendPerUser - spend;
      if (allowedDiscount <= 0) {
        return {
          isValid: false,
          discountAmount: 0,
          isFreeShipping: false,
          message: `You have reached the maximum accumulated discount limit of ৳${voucher.maxDiscountSpendPerUser} for this voucher.`,
        };
      }
      discount = allowedDiscount;
    }
  }

  if (discount <= 0) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      message: `Voucher ${voucher.code} gives no discount on this order.`,
    };
  }

  return {
    isValid: true,
    discountAmount: discount,
    isFreeShipping: isFreeShip,
    message: `Voucher ${voucher.code} applied! Saved ৳${discount.toLocaleString('en-US')}`,
  };
}
