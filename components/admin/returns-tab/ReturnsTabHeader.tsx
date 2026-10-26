import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Button } from '@/components/ui/Button';

export interface ReturnsTabHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  shippingReviewFilter: string;
  setShippingReviewFilter: (review: string) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
  };
  onRefresh: () => void;
  isLoading: boolean;
}

export const ReturnsTabHeader: React.FC<ReturnsTabHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  shippingReviewFilter,
  setShippingReviewFilter,
  counts,
  onRefresh,
  isLoading,
}) => {
  const statusTabs = [
    { id: 'All', label: 'All Returns', count: counts.all },
    { id: 'Pending', label: 'Pending Review', count: counts.pending },
    { id: 'Approved', label: 'Approved Pickup', count: counts.approved },
    { id: 'Completed', label: 'Refunded / Completed', count: counts.completed },
    { id: 'Rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 font-sans">Return & Refund Requests Management</h2>
          <p className="text-xs text-zinc-500">Inspect customer return items, manage courier return shipping fees, and disburse refunds.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" disabled={isLoading} className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5">
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              statusFilter === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${
              statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Shipping Review Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-zinc-100">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Return ID, Order ID, customer name, phone, or reason..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:border-primary text-zinc-900"
          />
        </div>
        <div className="shrink-0">
          <CustomDropdown
            value={shippingReviewFilter}
            onChange={setShippingReviewFilter}
            options={[
              { label: 'All Shipping Reviews', value: 'All' },
              { label: 'Pending Shipping Review', value: 'pending' },
              { label: 'Shipping Waived (Company)', value: 'waived' },
              { label: 'Shipping Applied (Customer)', value: 'applied' },
            ]}
            className="h-10 text-xs w-56"
          />
        </div>
      </div>
    </div>
  );
};
