import React from 'react';
import type { Order } from '@/store/useOrderStore';
import { Badge } from '@/components/ui/Badge';

const adminStatusMap: Record<
  NonNullable<Order['paymentStatus']>,
  { variant: 'neutral' | 'warning' | 'info' | 'success' | 'error'; label: string }
> = {
  cod_due: { variant: 'neutral', label: 'COD - Collect on delivery' },
  awaiting_verification: { variant: 'warning', label: 'Verify payment' },
  awaiting_gateway: { variant: 'info', label: 'Awaiting card payment' },
  paid: { variant: 'success', label: 'Paid' },
  failed: { variant: 'error', label: 'Payment failed' },
};

const customerStatusMap: Record<
  NonNullable<Order['paymentStatus']>,
  { variant: 'neutral' | 'warning' | 'info' | 'success' | 'error'; label: string }
> = {
  cod_due: { variant: 'neutral', label: 'Pay on delivery' },
  awaiting_verification: { variant: 'warning', label: 'Payment being verified' },
  awaiting_gateway: { variant: 'info', label: 'Awaiting card payment' },
  paid: { variant: 'success', label: 'Payment received' },
  failed: { variant: 'error', label: 'Payment not confirmed' },
};

export const PaymentStatusBadge: React.FC<{
  status?: Order['paymentStatus'];
  size?: 'sm' | 'md';
  audience?: 'admin' | 'customer';
}> = ({
  status,
  size = 'sm',
  audience = 'admin',
}) => {
  const map = audience === 'customer' ? customerStatusMap : adminStatusMap;

  if (!status || !map[status]) {
    return null;
  }

  const { variant, label } = map[status];

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};
