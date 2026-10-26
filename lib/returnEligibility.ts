import { Order } from '@/store/useOrderStore';
import { ReturnRequest } from '@/store/useReturnStore';

export function getRemainingReturnQty(order: Order, returnRequests: ReturnRequest[]): number {
  if (!order || !order.items) return 0;
  const ordered = order.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  
  const matchingReturns = (returnRequests || []).filter(r => {
    if (!r || r.status === 'Rejected' || !r.orderId) return false;
    return String(r.orderId).trim() === String(order.id).trim();
  });

  const returned = matchingReturns.reduce((sum, r) => {
    const itemsSum = (r.items || []).reduce((s, ri) => s + (Number(ri?.quantity) || 1), 0);
    return sum + itemsSum;
  }, 0);

  return Math.max(0, ordered - returned);
}
