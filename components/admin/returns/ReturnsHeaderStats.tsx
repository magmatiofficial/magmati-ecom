/**
 * @file components/admin/returns/ReturnsHeaderStats.tsx
 * @description Header banner and KPI statistic cards for product returns management.
 */

'use client';

import React from 'react';
import { RotateCcw, Package, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReturnsHeaderStatsProps {
  counts: {
    all?: number;
    Pending?: number;
    Approved?: number;
    Rejected?: number;
    Completed?: number;
  };
  statusFilter: string;
  setStatusFilter: (status: any) => void;
  refreshCounts: () => void;
}

export function ReturnsHeaderStats({ counts, statusFilter, setStatusFilter, refreshCounts }: ReturnsHeaderStatsProps) {
  const statCards = [
    { key: 'All', label: 'Total Requests', count: counts.all || 0, icon: Package, color: 'text-zinc-700 bg-zinc-100' },
    { key: 'Pending', label: 'Pending Review', count: counts.Pending || 0, icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { key: 'Approved', label: 'Approved', count: counts.Approved || 0, icon: CheckCircle2, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    { key: 'Completed', label: 'Refunded', count: counts.Completed || 0, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { key: 'Rejected', label: 'Rejected', count: counts.Rejected || 0, icon: XCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-primary" />
            <span>Product Returns & Refunds Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Review customer return claims, inspect photographic evidence, coordinate courier pickups, and issue refunds.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshCounts}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold shadow-3xs inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Refresh Counts</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = statusFilter === card.key;
          return (
            <div
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-3xs",
                isActive
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-primary/30"
                  : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-2xs font-extrabold uppercase tracking-wider", isActive ? "text-zinc-400" : "text-zinc-500")}>
                  {card.label}
                </span>
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", isActive ? "bg-white/10 text-white" : card.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                  {card.count}
                </span>
                <span className={cn("text-3xs font-bold underline", isActive ? "text-primary-foreground" : "text-primary")}>
                  Filter
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
