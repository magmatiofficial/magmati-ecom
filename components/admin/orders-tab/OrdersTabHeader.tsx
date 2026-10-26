import React from 'react';
import { Search, Download, Trash2, RefreshCw } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Button } from '@/components/ui/Button';

export interface OrdersTabHeaderProps {
  adminOrderSearch: string;
  setAdminOrderSearch: (val: string) => void;
  adminOrderStatusFilter: string;
  setAdminOrderStatusFilter: (status: any) => void;
  adminPaymentFilter: string;
  setAdminPaymentFilter: (payment: any) => void;
  counts: {
    all: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  onExportCSV: () => void;
  onExportJSON: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  selectedOrderIdsLength: number;
  onBulkDelete: () => void;
}

export const OrdersTabHeader: React.FC<OrdersTabHeaderProps> = ({
  adminOrderSearch,
  setAdminOrderSearch,
  adminOrderStatusFilter,
  setAdminOrderStatusFilter,
  adminPaymentFilter,
  setAdminPaymentFilter,
  counts,
  onExportCSV,
  onExportJSON,
  onRefresh,
  isLoading,
  selectedOrderIdsLength,
  onBulkDelete,
}) => {
  const statusTabs = [
    { id: 'All', label: 'All Orders', count: counts.all },
    { id: 'Pending', label: 'Pending', count: counts.pending },
    { id: 'Processing', label: 'Processing', count: counts.processing },
    { id: 'Shipped', label: 'Shipped', count: counts.shipped },
    { id: 'Delivered', label: 'Delivered', count: counts.delivered },
    { id: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 font-sans">Order Fulfillment & Management</h2>
          <p className="text-xs text-zinc-500">Track customer orders, verify online payments, print invoices, and update delivery statuses.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrderIdsLength > 0 && (
            <Button onClick={onBulkDelete} variant="danger" className="h-10 px-4 rounded-xl text-xs font-bold gap-2">
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedOrderIdsLength})
            </Button>
          )}
          <Button onClick={onExportCSV} variant="outline" className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={onExportJSON} variant="outline" className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5">
            <Download className="w-4 h-4" /> Export JSON
          </Button>
          <Button onClick={onRefresh} variant="outline" disabled={isLoading} className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAdminOrderStatusFilter(tab.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              adminOrderStatusFilter === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${
              adminOrderStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Payment Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-zinc-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={adminOrderSearch}
            onChange={(e) => setAdminOrderSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, phone, or transaction ID..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:border-primary"
          />
        </div>
        <div className="shrink-0">
          <CustomDropdown
            value={adminPaymentFilter}
            onChange={setAdminPaymentFilter}
            options={[
              { label: 'All Payment Statuses', value: 'All' },
              { label: 'Awaiting Verification (bKash/Nagad)', value: 'awaiting_verification' },
              { label: 'Awaiting Gateway Card', value: 'awaiting_gateway' },
              { label: 'Paid / Verified', value: 'paid' },
              { label: 'Payment Failed', value: 'failed' },
              { label: 'COD Due', value: 'cod_due' },
            ]}
            className="h-10 text-xs w-56"
          />
        </div>
      </div>
    </div>
  );
};
