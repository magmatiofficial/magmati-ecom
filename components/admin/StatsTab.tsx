'use client';

import React from 'react';
import { 
  TrendingUp, 
  ChevronRight, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Ticket, 
  Layers, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Plus,
  BarChart3,
  Activity,
  Zap,
  Flame
} from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { Product } from '@/types';
import { UserProfile } from '@/store/useAuthStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';

interface StatsTabProps {
  orders: Order[];
  products: Product[];
  users: UserProfile[];
  
  formatBDT: (amount: number, lang?: any) => string;
  setActiveAdminTab: (tab: any) => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  orders,
  products,
  users,
    formatBDT,
  setActiveAdminTab,
}) => {
  // Calculate metrics locally
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const activeProductsCount = products.length;
  const pendingDispatches = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const totalCustomers = users.length;

  // Low stock items count
  const lowStockItems = products.filter((p) => (p.stockQuantity ?? 10) <= (p.lowStockThreshold ?? 5));

  // Order status counts
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped' || (o as any).status === 'Dispatched').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  // Average order value
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / (deliveredCount || 1)) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Top Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-emerald-400 text-2xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{'Store System Operational & Secured'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {'Executive Command Center'}
          </h2>
          <p className="text-xs text-zinc-300 max-w-xl">
            {'Real-time oversight of marketplace sales, order fulfillment queues, inventory stock thresholds, and customer engagement.'}
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveAdminTab('products')}
            className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{'Add Product'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('orders')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>{'View Orders Queue'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid (6 Executive Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Gross Delivered Sales */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
              {'Gross Delivered Sales'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 font-mono block">
              {formatBDT(totalSales)}
            </span>
            <div className="text-2xs text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{deliveredOrders.length} {'successful deliveries'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div 
          onClick={() => setActiveAdminTab('orders')}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
              {'Total Orders Placed'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 font-mono block">
              {totalOrders}
            </span>
            <div className="text-2xs text-blue-600 mt-1 flex items-center gap-1 font-semibold">
              <span>{pendingDispatches} {'awaiting fulfillment'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Card 3: Active Products */}
        <div 
          onClick={() => setActiveAdminTab('products')}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
              {'Marketplace Products'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 font-mono block">
              {activeProductsCount}
            </span>
            <div className="text-2xs text-purple-600 mt-1 font-semibold">
              {'Live catalog inventory'}
            </div>
          </div>
        </div>

        {/* Card 4: Registered Customers */}
        <div 
          onClick={() => setActiveAdminTab('customers')}
          className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
              {'Registered Users'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 font-mono block">
              {totalCustomers}
            </span>
            <div className="text-2xs text-amber-600 mt-1 font-semibold">
              {'Active customer profiles'}
            </div>
          </div>
        </div>

        {/* Card 5: Low Stock Alerts */}
        <div 
          onClick={() => setActiveAdminTab('products')}
          className={`rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all flex flex-col justify-between cursor-pointer group ${
            lowStockItems.length > 0 
              ? 'bg-red-50/50 border-red-200 hover:border-red-400' 
              : 'bg-white border-zinc-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-2xs font-bold uppercase tracking-wider ${lowStockItems.length > 0 ? 'text-red-700' : 'text-zinc-500'}`}>
              {'Low Stock Alerts'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${lowStockItems.length > 0 ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-lg sm:text-2xl font-black font-mono block ${lowStockItems.length > 0 ? 'text-red-700' : 'text-zinc-900'}`}>
              {lowStockItems.length} {'items'}
            </span>
            <div className={`text-2xs mt-1 font-semibold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-zinc-500'}`}>
              {lowStockItems.length > 0 ? ('Restock immediately') : ('Stock levels healthy')}
            </div>
          </div>
        </div>

        {/* Card 6: Average Order Value */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
              {'Avg Order Value'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-2xl font-black text-zinc-900 font-mono block">
              {formatBDT(avgOrderValue)}
            </span>
            <div className="text-2xs text-indigo-600 mt-1 font-semibold">
              {'Per delivered order'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Order Status Visual Bar Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {'Order Fulfillment & Workflow Analytics'}
            </h3>
            <span className="text-2xs text-zinc-500 font-mono bg-zinc-100 px-2.5 py-1 rounded-lg">
              {totalOrders} {'Total Orders'}
            </span>
          </div>

          <div className="space-y-3.5 py-2">
            {[
              { label: 'Pending Review', count: pendingCount, color: 'bg-amber-500' },
              { label: 'Processing', count: processingCount, color: 'bg-blue-500' },
              { label: 'Shipped / Dispatched', count: shippedCount, color: 'bg-purple-500' },
              { label: 'Delivered Successfully', count: deliveredCount, color: 'bg-emerald-500' },
              { label: 'Cancelled', count: cancelledCount, color: 'bg-red-500' },
            ].map((item, idx) => {
              const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-700">{item.label}</span>
                    <span className="font-mono font-bold text-zinc-900">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-2xs text-zinc-500">
            <span>{'Real-time database sync active'}</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
            </span>
          </div>
        </div>

        {/* Right Col: Quick Admin Navigation Hub */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-zinc-100">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {'Quick Management Hub'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'products', label: 'Products', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
              { id: 'orders', label: 'Orders', icon: Package, color: 'text-amber-600 bg-amber-50' },
              { id: 'customers', label: 'Customers', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
              { id: 'bestDeals', label: 'Best Deals', icon: Flame, color: 'text-rose-600 bg-rose-50' },
              { id: 'vouchers', label: 'Vouchers', icon: Ticket, color: 'text-purple-600 bg-purple-50' },
              { id: 'settings', label: 'Settings', icon: ShieldCheck, color: 'text-zinc-600 bg-zinc-100' },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveAdminTab(nav.id)}
                  className="p-3 rounded-xl border border-zinc-200/80 hover:border-primary/50 hover:bg-zinc-50/80 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-lg ${nav.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">{nav.label}</div>
                    <div className="text-2xs text-zinc-400">Control</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <span className="text-2xs text-zinc-400">
              {'All panels managed centrally'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Real-time Orders Snapshot Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-100">
          <div>
            <h3 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-wider">
              {'Recent Dispatch Orders Snapshot'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveAdminTab('orders')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{'View All Orders'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <ResponsiveTableContainer showScrollCues={true}>
          <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[850px]">
            <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Order ID</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Customer</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Date</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Items</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Total (BDT)</th>
                <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white text-zinc-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                    {'No orders recorded yet.'}
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/45 transition-colors group">
                    <td className="px-3 py-2 border-b border-r border-zinc-200 font-bold font-mono text-primary group-hover:underline text-xs">
                      #{order.id}
                    </td>
                    <td className="px-3 py-2 border-b border-r border-zinc-200">
                      <div className="font-bold text-zinc-900 text-xs">{order.userName}</div>
                      <div className="text-2xs text-zinc-500">{order.phone}</div>
                    </td>
                    <td className="px-3 py-2 border-b border-r border-zinc-200 text-zinc-500 font-medium text-2xs">
                      {order.date}
                    </td>
                    <td className="px-3 py-2 border-b border-r border-zinc-200">
                      <div className="text-xs text-zinc-700">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ({order.items.map(i => i.product.name).slice(0, 2).join(', ')}{order.items.length > 2 ? '...' : ''})
                      </div>
                    </td>
                    <td className="px-3 py-2 border-b border-r border-zinc-200 font-bold text-right text-zinc-900 text-xs">
                      {formatBDT(order.total)}
                    </td>
                    <td className="px-3 py-2 border-b border-r border-zinc-200 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-2xs font-bold tracking-wider uppercase inline-block border ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : order.status === 'Shipped' || (order as any).status === 'Dispatched'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : order.status === 'Processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTableContainer>
      </div>
    </div>
  );
};
