'use client';

import React from 'react';
import { X, Users, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/store/useAuthStore';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCustomer: UserProfile | null;
  
  custName: string;
  setCustName: (v: string) => void;
  custEmail: string;
  setCustEmail: (v: string) => void;
  custPhone: string;
  setCustPhone: (v: string) => void;
  custAddress: string;
  setCustAddress: (v: string) => void;
  custRole: 'admin' | 'customer';
  setCustRole: (v: 'admin' | 'customer') => void;
  customerFormError: string | null;
  onSubmit?: (e: React.FormEvent) => void;
  handleSubmit?: (e: React.FormEvent) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  editingCustomer,
    custName,
  setCustName,
  custEmail,
  setCustEmail,
  custPhone,
  setCustPhone,
  custAddress,
  setCustAddress,
  custRole,
  setCustRole,
  customerFormError,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[88dvh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                {editingCustomer
                  ? ('Edit Customer Account & Role')
                  : ('Add New Customer Account')}
              </h3>
              <p className="text-eyebrow text-zinc-500">
                {'Configure profile details, system roles, and contact info'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {customerFormError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{customerFormError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 pt-4 text-xs font-sans">
          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              disabled={Boolean(editingCustomer)}
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
              placeholder="e.g. tanvir@example.com"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Mobile Phone (BD) *</label>
            <input
              type="tel"
              required
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary font-mono"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Delivery Address</label>
            <textarea
              rows={2}
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              placeholder="House, Road, Area, Thana, District"
              className="w-full p-2.5 border border-zinc-200 rounded-xl resize-none focus:outline-hidden focus:border-primary"
            />
          </div>

          <div>
            <label className="text-eyebrow font-bold text-zinc-700 block mb-1">Account Role *</label>
            <select
              value={custRole}
              onChange={(e) => setCustRole(e.target.value as 'admin' | 'customer')}
              className="w-full h-10 px-3 border border-zinc-200 rounded-xl bg-white focus:outline-hidden font-medium"
            >
              <option value="customer">Regular Customer</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4 border-t border-zinc-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {editingCustomer ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
