'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, Search, Eye, FileText, Trash2, Download, CheckCircle2, Phone, MapPin, User as UserIcon, MessageCircle } from 'lucide-react';
import { Order, useOrderStore } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { exportOrdersToCSV, exportOrdersToJSON } from '@/lib/dataTransferUtils';
import { cleanWhatsAppNumber } from '@/lib/utils';
import { InvoiceModal } from '@/components/invoice/InvoiceModal';
import { AdminProductDetailsModal } from '@/components/admin/modals/AdminProductDetailsModal';

interface OrdersTabProps {
  orders: Order[];
  adminOrderSearch: string;
  setAdminOrderSearch: (val: string) => void;
  adminOrderStatusFilter: string;
  setAdminOrderStatusFilter: (status: any) => void;
  
  formatBDT: (amount: number) => string;
  updateOrderStatus: (orderId: string, status: any) => void;
  setSelectedOrderDetails: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  adminOrderSearch,
  setAdminOrderSearch,
  adminOrderStatusFilter,
  setAdminOrderStatusFilter,
    formatBDT,
  updateOrderStatus,
  setSelectedOrderDetails,
  deleteOrder,
}) => {
  const { clearAllOrders } = useOrderStore();
  const { products } = useProductStore();
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedOrderItemContext, setSelectedOrderItemContext] = useState<any>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [orderToast, setOrderToast] = useState('');

  const handleOpenProductDetails = (item: any) => {
    const prodId = item.product?.id || (item as any)?.productId;
    const catalogProd = products.find((p) => p.id === prodId) || item.product;
    if (!catalogProd) return;
    setSelectedProductDetails(catalogProd);
    setSelectedOrderItemContext({
      selectedSize: item.selectedSize || (item as any)?.size,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      customPrice: item.customPrice,
    });
  };

  const handleWipeOrders = async () => {
    try {
      setIsWiping(true);
      await clearAllOrders();
      setSelectedOrderIds([]);
      setShowWipeConfirm(false);
      setOrderToast(
        'All order data reset and wiped successfully!'
      );
      setTimeout(() => setOrderToast(''), 4500);
    } catch (err: any) {
      setOrderToast(err?.message || 'Failed to wipe orders');
    } finally {
      setIsWiping(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped' || (o as any).status === 'Dispatched').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  const filteredAdminOrders = orders.filter((o) => {
    const query = adminOrderSearch.toLowerCase().trim();
    const matchesSearch = !query || 
      o.id.toLowerCase().includes(query) ||
      o.userName.toLowerCase().includes(query) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(query)) ||
      (o.phone && o.phone.includes(query)) ||
      (o.address && o.address.toLowerCase().includes(query));
    const matchesStatus = adminOrderStatusFilter === 'All' || o.status === adminOrderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredAdminOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredAdminOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((i) => i !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleBulkStatusUpdate = (status: any) => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach((id) => {
      updateOrderStatus(id, status);
    });
    setOrderToast(`Successfully updated ${selectedOrderIds.length} orders to status: ${status}`);
    setTimeout(() => setOrderToast(''), 5000);
    setSelectedOrderIds([]);
  };

  return (
    <div className="space-y-2">
      {/* Header, Status Metric Pills & Search Bar - Compact Control Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3.5 sm:p-4 shadow-sm space-y-3 font-sans">
        {/* Top Row: Title + Total Orders Badge + Compact Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="font-sans text-base sm:text-lg font-black text-zinc-950 flex items-center gap-2">
                <span>{'Orders Fulfillment & Dispatch Queue'}</span>
              </h2>
              <p className="text-xs text-zinc-600 font-semibold mt-0.5">
                {'Manage customer orders, addresses & fulfillment status'}
              </p>
            </div>
            <span className="text-xs font-black bg-primary text-white px-3 py-1 rounded-full ml-auto sm:ml-2 shadow-2xs whitespace-nowrap shrink-0 inline-flex items-center gap-1">
              <span>{orders.length}</span>
              <span>{'Total'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminOrderSearch}
                onChange={(e) => setAdminOrderSearch(e.target.value)}
                placeholder={'Search Order ID, customer, phone...'}
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary text-zinc-900 font-sans"
              />
            </div>
            {adminOrderSearch && (
              <button
                type="button"
                onClick={() => setAdminOrderSearch('')}
                className="px-2 h-8 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => exportOrdersToCSV(filteredAdminOrders)}
              className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              title="Export Orders as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={() => exportOrdersToJSON(filteredAdminOrders)}
              className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              title="Export Orders as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>

            {orders.length > 0 && (
              !showWipeConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(true)}
                  className="h-8 px-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  title="Reset / Wipe all orders for clean production launch"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>{'Reset'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 p-0.5 bg-red-50 border border-red-300 rounded-xl animate-in fade-in">
                  <button
                    type="button"
                    disabled={isWiping}
                    onClick={handleWipeOrders}
                    className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-2xs font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isWiping ? 'Wiping...' : ('Confirm Wipe')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWipeConfirm(false)}
                    className="h-7 px-1.5 bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-2xs font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {orderToast && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{orderToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderToast('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xs cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Metric Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
          {[
            { key: 'All', label: 'All Orders', count: orders.length },
            { key: 'Pending', label: 'Pending', count: pendingCount },
            { key: 'Processing', label: 'Processing', count: processingCount },
            { key: 'Shipped', label: 'Shipped', count: shippedCount },
            { key: 'Delivered', label: 'Delivered', count: deliveredCount },
            { key: 'Cancelled', label: 'Cancelled', count: cancelledCount },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setAdminOrderStatusFilter(pill.key as any)}
              className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer font-sans ${
                adminOrderStatusFilter === pill.key
                  ? 'bg-secondary text-white font-bold border-secondary shadow-2xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              <div className="text-2xs font-bold uppercase tracking-wider truncate">{pill.label}</div>
              <div className="text-xs font-black mt-0.5">{pill.count}</div>
            </button>
          ))}
        </div>

        {/* Bulk Actions Bar */}
        {selectedOrderIds.length > 0 && (
          <div className="flex items-center justify-between gap-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-sans">
            <span className="font-bold text-amber-900">
              {selectedOrderIds.length} {'orders selected'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleBulkStatusUpdate('Processing')}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-2xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Set Processing
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusUpdate('Shipped')}
                className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-bold text-2xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Set Shipped
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusUpdate('Delivered')}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Set Delivered
              </button>
              <button
                type="button"
                onClick={() => {
                  selectedOrderIds.forEach((id) => deleteOrder(id));
                  setOrderToast(
                    `${selectedOrderIds.length} orders deleted successfully`
                  );
                  setSelectedOrderIds([]);
                  setTimeout(() => setOrderToast(''), 3500);
                }}
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold text-2xs hover:bg-red-700 transition-colors cursor-pointer"
              >
                {'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="px-2.5 py-1 bg-zinc-200 text-zinc-700 rounded-lg font-bold text-2xs hover:bg-zinc-300 transition-colors cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <ResponsiveTableContainer showScrollCues={true}>
        <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[950px]">
          <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-2.5 py-2.5 border-b border-r border-zinc-200 bg-zinc-100 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredAdminOrders.length > 0 && selectedOrderIds.length === filteredAdminOrders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">Order ID</th>
              <th className="px-3.5 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">Customer & Contact</th>
              <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">Date</th>
              <th className="px-3.5 py-2.5 border-b border-r border-zinc-200 bg-zinc-100">Items Summary</th>
              <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100 text-right">Total (BDT)</th>
              <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100 text-center">Status Control</th>
              <th className="px-3 py-2.5 border-b border-r border-zinc-200 bg-zinc-100 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredAdminOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  {'No orders found matching filter criteria.'}
                </td>
              </tr>
            ) : (
              filteredAdminOrders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);

                return (
                  <tr key={order.id} className={`hover:bg-amber-50/40 transition-colors group ${isSelected ? 'bg-amber-50/60' : ''}`}>
                    <td className="px-2.5 py-2 border-b border-r border-zinc-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>

                    {/* Order ID - Clickable to open details */}
                    <td className="px-3 py-2 border-b border-r border-zinc-200 font-bold font-mono text-zinc-900 whitespace-nowrap text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderDetails(order)}
                        className="text-primary hover:underline flex items-center gap-1 font-extrabold cursor-pointer"
                        title="Click to view full order details"
                      >
                        <span>#{order.id}</span>
                      </button>
                    </td>

                    {/* Clean Customer Details */}
                    <td className="px-3.5 py-2 border-b border-r border-zinc-200 min-w-[170px]">
                      <div className="font-extrabold text-xs text-zinc-900 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[130px]">{order.userName}</span>
                      </div>
                      <div className="text-xs text-zinc-700 font-mono font-semibold flex items-center gap-1.5 mt-1">
                        <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>{order.phone || 'N/A'}</span>
                        {order.phone && (
                          <div className="flex items-center gap-1 ml-auto">
                            <a
                              href={`tel:${order.phone.replace(/[^\d+]/g, '')}`}
                              className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                              title="Call customer directly"
                            >
                              <Phone className="w-2.5 h-2.5" />
                            </a>
                            <a
                              href={`https://wa.me/${cleanWhatsAppNumber(order.phone)}?text=${encodeURIComponent(
                                `Hello ${order.userName}, we are contacting you from MAGMATI regarding your order #${order.id}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Message customer on WhatsApp"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                      {order.district && (
                        <div className="mt-1">
                          <span className="inline-block bg-zinc-100 text-zinc-700 text-2xs font-extrabold px-1.5 py-0.2 rounded border border-zinc-200">
                            📍 {order.district}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2 border-b border-r border-zinc-200 text-zinc-600 font-medium whitespace-nowrap text-2xs">
                      {order.date}
                    </td>

                    {/* Items summary with Catalog Thumbnails and Click-to-View Product Details */}
                    <td className="px-3.5 py-2.5 border-b border-r border-zinc-200 min-w-[240px]">
                      <div className="space-y-1.5">
                        {order.items.map((it, idx) => {
                          const prodId = it.product?.id || (it as any)?.productId;
                          const catalogProd = products.find((p) => p.id === prodId) || it.product;
                          const prodName = catalogProd?.name || it.product?.name || (it as any)?.name || 'Product';
                          const prodImg = catalogProd?.images?.[0] || catalogProd?.image || it.product?.image || it.product?.images?.[0];
                          const sizeLabel = it.selectedSize || (it as any)?.size || 'Standard';
                          const qty = it.quantity || 1;

                          return (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 group/item"
                            >
                              {/* Product Thumbnail - Clickable */}
                              <button
                                type="button"
                                onClick={() => handleOpenProductDetails(it)}
                                className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer shadow-2xs group-hover/item:scale-105 active:scale-95"
                                title={`Click to view full details of "${prodName}"`}
                              >
                                {prodImg ? (
                                  <Image
                                    src={prodImg}
                                    alt={prodName}
                                    fill
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                    sizes="32px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                                    <Package className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </button>

                              {/* Product Name & Variations - Clickable */}
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProductDetails(it)}
                                  className="text-left font-semibold text-xs text-zinc-900 hover:text-primary hover:underline transition-colors truncate block max-w-[180px] cursor-pointer"
                                  title={`Click to view details for "${prodName}"`}
                                >
                                  {prodName}
                                </button>
                                <div className="flex items-center gap-1.5 text-2xs text-zinc-500 font-mono">
                                  <span className="bg-zinc-100 px-1 rounded text-zinc-700 font-semibold border border-zinc-200">
                                    {sizeLabel}
                                  </span>
                                  <span>×</span>
                                  <span className="font-bold text-zinc-900">{qty}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-3 py-2 border-b border-r border-zinc-200 font-bold text-right text-zinc-900 whitespace-nowrap text-xs">
                      {formatBDT(order.total)}
                    </td>

                    <td className="px-3 py-2 border-b border-r border-zinc-200 text-center min-w-[120px]">
                      <CustomDropdown
                        value={order.status}
                        onChange={(val) => updateOrderStatus(order.id, val as Order['status'])}
                        searchable={false}
                        options={[
                          { value: 'Pending', label: 'Pending' },
                          { value: 'Processing', label: 'Processing' },
                          { value: 'Shipped', label: 'Shipped' },
                          { value: 'Delivered', label: 'Delivered' },
                          { value: 'Cancelled', label: 'Cancelled' },
                        ]}
                        triggerClassName="h-7 px-2 text-2xs font-bold rounded-lg bg-zinc-50 border-zinc-200"
                        dropdownClassName="min-w-[120px]"
                      />
                    </td>

                    {/* Actions Column: View Details, Printable Invoice, Delete */}
                    <td className="px-3 py-2 border-b border-r border-zinc-200 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-2 py-1 bg-primary text-white hover:bg-primary-hover rounded-lg text-2xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                          title="View Full Customer & Shipping Details"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{'Details'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 rounded-lg text-2xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="View Official Tax Invoice"
                        >
                          <FileText className="w-3 h-3 text-zinc-600" />
                          <span>Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            deleteOrder(order.id);
                            setOrderToast(
                              `Order #${order.id} deleted`
                            );
                            setTimeout(() => setOrderToast(''), 3000);
                          }}
                          className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-2xs font-bold transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ResponsiveTableContainer>

      {/* Official Tax Invoice Modal for Admin */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Product Details Modal for Ordered Items */}
      <AdminProductDetailsModal
        isOpen={!!selectedProductDetails}
        product={selectedProductDetails}
        orderItemContext={selectedOrderItemContext}
        onClose={() => {
          setSelectedProductDetails(null);
          setSelectedOrderItemContext(null);
        }}
        formatBDT={formatBDT}
      />
    </div>
  );
};
