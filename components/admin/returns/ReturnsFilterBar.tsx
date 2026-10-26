/**
 * @file components/admin/returns/ReturnsFilterBar.tsx
 * @description Filter bar component with real-time search and status selection for returns.
 */

'use client';

import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { ReturnRequest } from '@/store/useReturnStore';

interface ReturnsFilterBarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: 'All' | ReturnRequest['status'];
  setStatusFilter: (v: any) => void;
  refresh: () => void;
  isLoading: boolean;
}

export function ReturnsFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  refresh,
  isLoading,
}: ReturnsFilterBarProps) {
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Completed', label: 'Completed (Refunded)' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Return ID, Order #, Phone or Customer..."
          className="w-full pl-10 pr-9 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 hover:text-zinc-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <CustomDropdown
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          options={statusOptions}
          className="w-48 text-xs font-bold"
          dropdownClassName="text-left"
        />

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          title="Reload Returns"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
