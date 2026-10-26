'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order, useOrderStore, WIPE_CONFIRM_PHRASE } from '@/store/useOrderStore';
import { useProductStore } from '@/store/useProductStore';
import { useAdminOrdersPage } from '@/hooks/useAdminOrdersPage';
import { useAdminOrderChangeStore } from '@/store/useAdminOrderChangeStore';
import { Product } from '@/types';
import { exportOrdersToCSV, exportOrdersToJSON } from '@/lib/dataTransferUtils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/store/useToastStore';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import { OrdersTabHeader } from './orders-tab/OrdersTabHeader';
import { OrdersTable } from './orders-tab/OrdersTable';

interface OrdersTabProps {
  adminOrderSearch: string;
  setAdminOrderSearch: (val: string) => void;
  adminOrderStatusFilter: string;
  setAdminOrderStatusFilter: (status: any) => void;
  formatBDT: (amount: number) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setSelectedOrderDetails: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  setSelectedInvoiceOrder?: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
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
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [adminPaymentFilter, setAdminPaymentFilter] = useState<'All' | 'awaiting_verification' | 'awaiting_gateway' | 'paid' | 'failed' | 'cod_due'>('All');

  // Paginated server hook
  const {
    orders: pagedOrders,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    newOrdersAvailable,
    loadMore,
    refresh,
    refreshCounts,
    patchOrder,
    removeOrder,
  } = useAdminOrdersPage({
    status: adminOrderStatusFilter,
    paymentStatus: adminPaymentFilter,
    search: adminOrderSearch,
  });

  const lastOrderChange = useAdminOrderChangeStore((s) => s.lastChange);
  const handledChangeRef = useRef<number>(lastOrderChange?.nonce ?? 0);

  useEffect(() => {
    if (lastOrderChange && lastOrderChange.nonce !== handledChangeRef.current) {
      handledChangeRef.current = lastOrderChange.nonce;
      patchOrder(lastOrderChange.orderId, lastOrderChange.patch);
      refreshCounts();
    }
  }, [lastOrderChange, patchOrder, refreshCounts]);

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [adminOrderStatusFilter, adminPaymentFilter, adminOrderSearch]);

  // Shared Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'danger';
    requireTypedPhrase?: string;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
    setIsConfirmLoading(true);
    try {
      await clearAllOrders();
      setSelectedOrderIds([]);
      setConfirmDialog(prev => ({ ...prev, open: false }));
      refresh();
      toast.success('All order data reset and wiped successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to wipe orders');
    } finally {
      setIsConfirmLoading(false);
    }
  };

  const openWipeConfirm = () => {
    setConfirmDialog({
      open: true,
      title: 'Wipe All Order Data',
      message: 'Permanently delete ALL orders? This also clears all stored TrxID records and voucher usage records. Product stock is NOT restored. This cannot be undone.',
      confirmLabel: 'Wipe all orders',
      cancelLabel: 'Cancel',
      onConfirm: handleWipeOrders,
      variant: 'danger',
      requireTypedPhrase: WIPE_CONFIRM_PHRASE,
    });
  };

  const openBulkDeleteConfirm = () => {
    const count = selectedOrderIds.length;
    const activeCount = selectedOrderIds.filter((id) => {
      const o = pagedOrders.find((r) => r.id === id);
      return !o || (o.status !== 'Cancelled' && o.status !== 'Delivered');
    }).length;

    const message = activeCount > 0
      ? `Permanently delete ${count} selected orders? ${activeCount} of them are still active and will be cancelled first (stock is restored and voucher usage is reversed). Used TrxIDs stay reserved. This cannot be undone.`
      : `Permanently delete ${count} selected orders? This cannot be undone.`;

    setConfirmDialog({
      open: true,
      title: `Delete ${count} Orders`,
      message,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const ids = [...selectedOrderIds];
          const failedIds: string[] = [];
          const toDeleteIds: string[] = [];

          for (const id of ids) {
            const o = pagedOrders.find((r) => r.id === id);
            const isActive = !o || (o.status !== 'Cancelled' && o.status !== 'Delivered');
            if (isActive) {
              try {
                await updateOrderStatus(id, 'Cancelled');
                toDeleteIds.push(id);
              } catch {
                failedIds.push(id);
              }
            } else {
              toDeleteIds.push(id);
            }
          }

          const chunkSize = 50;
          const chunks: string[][] = [];
          for (let i = 0; i < toDeleteIds.length; i += chunkSize) {
            chunks.push(toDeleteIds.slice(i, i + chunkSize));
          }

          let removedCount = 0;

          for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
            const chunk = chunks[cIdx];
            const res = await authedFetchJson<{
              success?: boolean;
              deleted?: string[];
              missing?: string[];
              failed?: { id: string; reason: string }[];
              error?: string;
            }>('/api/admin/orders/delete', {
              method: 'POST',
              body: JSON.stringify({ ids: chunk }),
            });

            if (!res.ok || !res.data || res.data.success !== true) {
              for (let j = cIdx; j < chunks.length; j++) {
                failedIds.push(...chunks[j]);
              }
              break;
            }

            const deleted = res.data.deleted || [];
            const missing = res.data.missing || [];
            const failed = res.data.failed || [];

            for (const id of deleted) {
              removeOrder(id);
              removedCount++;
            }
            for (const id of missing) {
              removeOrder(id);
              removedCount++;
            }
            for (const item of failed) {
              if (item && item.id) {
                failedIds.push(item.id);
              }
            }
          }

          refreshCounts();
          if (failedIds.length > 0) {
            refresh();
          }

          setSelectedOrderIds(failedIds);
          setConfirmDialog((prev) => ({ ...prev, open: false }));

          if (removedCount > 0 && failedIds.length === 0) {
            toast.success(`${removedCount} orders deleted successfully`);
          } else if (removedCount > 0 && failedIds.length > 0) {
            toast.warning(`${removedCount} deleted, ${failedIds.length} could not be deleted. They stay selected.`);
          } else {
            toast.error(`No orders were deleted (${failedIds.length} failed). Check your connection and try again.`);
          }
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  const openSingleDeleteConfirm = (order: Order) => {
    setConfirmDialog({
      open: true,
      title: `Delete Order #${order.id}`,
      message: `Are you sure you want to permanently delete this order for ${order.userName}?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await deleteOrder(order.id);
          removeOrder(order.id);
          refreshCounts();
          toast.success(`Order #${order.id} deleted successfully`);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete order');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-4 font-sans">
      <OrdersTabHeader
        adminOrderSearch={adminOrderSearch}
        setAdminOrderSearch={setAdminOrderSearch}
        adminOrderStatusFilter={adminOrderStatusFilter}
        setAdminOrderStatusFilter={setAdminOrderStatusFilter}
        adminPaymentFilter={adminPaymentFilter}
        setAdminPaymentFilter={setAdminPaymentFilter}
        counts={{
          all: counts?.total || 0,
          pending: counts?.status?.Pending || 0,
          processing: counts?.status?.Processing || 0,
          shipped: counts?.status?.Shipped || 0,
          delivered: counts?.status?.Delivered || 0,
          cancelled: counts?.status?.Cancelled || 0,
        }}
        onExportCSV={() => exportOrdersToCSV(pagedOrders)}
        onExportJSON={() => exportOrdersToJSON(pagedOrders)}
        onRefresh={() => {
          refresh();
          refreshCounts();
          toast.success('Orders refreshed successfully!');
        }}
        isLoading={isLoading}
        selectedOrderIdsLength={selectedOrderIds.length}
        onBulkDelete={openBulkDeleteConfirm}
      />

      <OrdersTable
        orders={pagedOrders}
        selectedOrderIds={selectedOrderIds}
        setSelectedOrderIds={setSelectedOrderIds}
        formatBDT={formatBDT}
        updateOrderStatus={updateOrderStatus}
        setSelectedOrderDetails={setSelectedOrderDetails}
        setSelectedInvoiceOrder={(order) => setSelectedInvoiceOrder(order)}
        openSingleDeleteConfirm={openSingleDeleteConfirm}
        handleOpenProductDetails={handleOpenProductDetails}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        variant={confirmDialog.variant}
        requireTypedPhrase={confirmDialog.requireTypedPhrase}
      />
    </div>
  );
};
