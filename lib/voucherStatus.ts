import { Voucher } from '@/store/useVoucherStore';

export type VoucherStatus = 'active' | 'used' | 'expired' | 'inactive';

export function getVoucherStatus(
  v: Voucher,
  usage: Record<string, { usedCount: number; accumulatedDiscount: number }> = {}
): { status: VoucherStatus; usageText?: string } {
  const userUsage = usage || {};
  const used = userUsage[v.id]?.usedCount ?? 0;
  const spent = userUsage[v.id]?.accumulatedDiscount ?? 0;

  const usedUp = Boolean(
    (v.maxUsesPerCustomer && used >= v.maxUsesPerCustomer) ||
    (v.maxDiscountSpendPerUser && spent >= v.maxDiscountSpendPerUser)
  );

  let expired = false;
  if (v.expiresAt) {
    const expiryDate = new Date(v.expiresAt);
    if (!isNaN(expiryDate.getTime())) {
      expiryDate.setHours(23, 59, 59, 999);
      expired = Date.now() > expiryDate.getTime();
    }
  }

  let status: VoucherStatus = 'active';
  if (expired) {
    status = 'expired';
  } else if (usedUp) {
    status = 'used';
  } else if (!v.isActive) {
    status = 'inactive';
  } else {
    status = 'active';
  }

  let usageText: string | undefined = undefined;
  if (v.maxUsesPerCustomer) {
    const max = v.maxUsesPerCustomer;
    usageText = `Used ${used}/${max} · ${Math.max(0, max - used)} left`;
  } else if (v.maxDiscountSpendPerUser) {
    usageText = `Discount used ৳${spent} of ৳${v.maxDiscountSpendPerUser}`;
  }

  return { status, usageText };
}

export function voucherNeedsAccount(
  v: Pick<Voucher, 'requiresLogin' | 'maxUsesPerCustomer' | 'maxDiscountSpendPerUser'>
): boolean {
  return (
    Boolean(v.requiresLogin) ||
    (v.maxUsesPerCustomer ?? 0) > 0 ||
    (v.maxDiscountSpendPerUser ?? 0) > 0
  );
}
