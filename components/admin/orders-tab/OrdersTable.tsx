import React from 'react';
import { Eye, FileText, Trash2, Phone, MessageCircle } from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { TH, TD, TR } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { PaymentStatusBadge } from '@/components/admin/PaymentStatusBadge';
import { cleanWhatsAppNumber } from '@/lib/utils';

export interface OrdersTableProps {
  orders: Order[];
  selectedOrderIds: string[];
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<string[]>>;
  formatBDT: (amount: number) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setSelectedOrderDetails: (order: Order) => void;
  setSelectedInvoiceOrder: (order: Order) => void;
  openSingleDeleteConfirm: (order: Order) => void;
  handleOpenProductDetails: (item: any) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  selectedOrderIds,
  setSelectedOrderIds,
  formatBDT,
  updateOrderStatus,
  setSelectedOrderDetails,
  setSelectedInvoiceOrder,
  openSingleDeleteConfirm,
  handleOpenProductDetails,
  hasMore,
  isLoadingMore,
  onLoadMore,
}) => {
  const allSelected = orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((item) => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
      <ResponsiveTableContainer>
        <div className="min-w-[900px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-2.5 py-2 text-center w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    aria-label="Select all orders"
                  />
                </th>
                <th className="px-2.5 py-2 text-left">Order ID / Date</th>
                <th className="px-2.5 py-2 text-left">Customer</th>
                <th className="px-2.5 py-2 text-left">Items</th>
                <th className="px-2.5 py-2 text-left">Total</th>
                <th className="px-2.5 py-2 text-left">Payment Status</th>
                <th className="px-2.5 py-2 text-left">Fulfillment Status</th>
                <th className="px-2.5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400 text-xs">
                    No orders found matching the current filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const orderIdShort = order.id.slice(0, 8).toUpperCase();
                  const formattedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <TR key={order.id} selected={isSelected}>
                      <TD className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(order.id)}
                          className="rounded border-zinc-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          aria-label={`Select order ${orderIdShort}`}
                        />
                      </TD>
                      <TD>
                        <div>
                          <span className="font-bold text-zinc-900 font-mono text-xs">#{orderIdShort}</span>
                          <p className="text-2xs text-zinc-400">{formattedDate}</p>
                        </div>
                      </TD>
                      <TD>
                        <div>
                          <p className="font-bold text-zinc-800 text-xs">{order.userName || 'Customer'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {order.phone && (
                              <>
                                <a
                                  href={`tel:${order.phone}`}
                                  className="text-2xs text-zinc-500 hover:text-primary flex items-center gap-1 font-mono"
                                >
                                  <Phone className="w-3 h-3" />
                                  {order.phone}
                                </a>
                                <a
                                  href={`https://wa.me/${cleanWhatsAppNumber(order.phone)}?text=${encodeURIComponent(
                                    `Hi ${order.userName}, regarding your Magmati order #${orderIdShort}...`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-2xs text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-bold"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <div className="space-y-1 max-w-[200px]">
                          {order.items?.slice(0, 2).map((item, i) => (
                            <div
                              key={i}
                              onClick={() => handleOpenProductDetails(item)}
                              className="text-2xs text-zinc-700 truncate cursor-pointer hover:text-primary hover:underline flex items-center gap-1"
                              title="Click to view product details"
                            >
                              <span className="font-bold font-mono">({item.quantity}x)</span>
                              <span className="truncate">{item.product?.name || 'Product'}</span>
                            </div>
                          ))}
                          {(order.items?.length || 0) > 2 && (
                            <span className="text-3xs text-zinc-400 font-medium">
                              +{(order.items?.length || 0) - 2} more item(s)
                            </span>
                          )}
                        </div>
                      </TD>
                      <TD>
                        <span className="font-bold font-mono text-zinc-900 text-xs">
                          {formatBDT(order.total || 0)}
                        </span>
                      </TD>
                      <TD>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </TD>
                      <TD>
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`text-2xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-hidden ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : order.status === 'Processing'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : order.status === 'Shipped'
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : order.status === 'Cancelled'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-primary hover:bg-primary/10"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Print / View Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSingleDeleteConfirm(order)}
                            className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ResponsiveTableContainer>

      {/* Infinite Scroll / Load More Footer */}
      {hasMore && (
        <div className="p-4 text-center border-t border-zinc-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-xs font-bold rounded-xl"
          >
            {isLoadingMore ? 'Loading more orders...' : 'Load More Orders'}
          </Button>
        </div>
      )}
    </div>
  );
};
