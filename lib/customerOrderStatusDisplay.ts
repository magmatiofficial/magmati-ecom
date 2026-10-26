import { Order } from '@/store/useOrderStore';

export function getCustomerOrderStatusDisplay(
  status: string,
  paymentStatus?: Order['paymentStatus']
): { label: string; className: string } {
  const redClasses = 'bg-red-50 text-red-800 border-red-200';
  const amberClasses = 'bg-amber-50 text-amber-900 border-amber-200';
  const blueClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  const purpleClasses = 'bg-purple-50 text-purple-800 border-purple-200';
  const emeraldClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (status === 'Cancelled') {
    return { label: 'Cancelled', className: redClasses };
  }
  if (status === 'Pending' && paymentStatus === 'failed') {
    return { label: 'Payment failed', className: redClasses };
  }
  if (status === 'Pending' && paymentStatus === 'awaiting_verification') {
    return { label: 'Verifying payment', className: amberClasses };
  }
  if (status === 'Pending' && paymentStatus === 'awaiting_gateway') {
    return { label: 'Awaiting payment', className: amberClasses };
  }
  if (status === 'Pending') {
    return { label: 'Pending', className: amberClasses };
  }
  if (status === 'Processing') {
    return { label: 'Processing', className: blueClasses };
  }
  if (status === 'Shipped' || status === 'Dispatched') {
    return { label: 'Shipped', className: purpleClasses };
  }
  if (status === 'Delivered') {
    return { label: 'Delivered', className: emeraldClasses };
  }
  return { label: status, className: amberClasses };
}
