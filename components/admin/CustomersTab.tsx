'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, UserCheck, Edit, Trash2, Download } from 'lucide-react';
import { UserProfile } from '@/store/useAuthStore';
import { Order } from '@/store/useOrderStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { exportCustomersToCSV, exportCustomersToJSON } from '@/lib/dataTransferUtils';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface CustomersTabProps {
  users: UserProfile[];
  orders: Order[];
  
  adminCustomerSearch: string;
  setAdminCustomerSearch: (val: string) => void;
  adminCustomerRoleFilter: 'All' | 'customer' | 'admin';
  setAdminCustomerRoleFilter: (val: 'All' | 'customer' | 'admin') => void;
  openAddCustomerModal: () => void;
  currentUser: { email: string } | null;
  toggleUserRole: (id: string) => void;
  impersonateUser: (email: string, currentEmail: string) => void;
  openEditCustomerModal: (user: UserProfile) => void;
  reactivateUser: (id: string) => void;
  suspendUser: (id: string) => void;
  deleteUser: (id: string) => void;
  formatBDT: (amount: number, lang?: any) => string;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  users = [],
  orders = [],
    adminCustomerSearch,
  setAdminCustomerSearch,
  adminCustomerRoleFilter,
  setAdminCustomerRoleFilter,
  openAddCustomerModal,
  currentUser,
  toggleUserRole,
  impersonateUser,
  openEditCustomerModal,
  reactivateUser,
  suspendUser,
  deleteUser,
  formatBDT,
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  const filteredUsers = users.filter((u) => {
    const query = adminCustomerSearch.toLowerCase().trim();
    const matchesSearch = !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query)) ||
      (u.address && u.address.toLowerCase().includes(query));
    const matchesRole = adminCustomerRoleFilter === 'All' || u.role === adminCustomerRoleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((i) => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBulkSuspend = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach((id) => suspendUser(id));
    setSelectedUserIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach((id) => deleteUser(id));
    setSelectedUserIds([]);
  };

  return (
    <div className="space-y-2">
      {/* Header, Stat Badges, Search & Filter - Compact Control Bar */}
      <div className="bg-white rounded-card border border-neutral-200 p-2 sm:px-3 sm:py-2.5 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-950 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {'Customer & User Accounts Control'}
            </h3>
            <div className="flex items-center gap-1 text-2xs sm:text-xs font-bold">
              <span className="px-2 py-0.5 rounded-badge bg-neutral-100 text-neutral-700">
                {totalUsers} {'Total'}
              </span>
              <span className="px-2 py-0.5 rounded-badge bg-amber-50 text-amber-800 border border-amber-200/80">
                {adminCount} {'Admins'}
              </span>
              <span className="px-2 py-0.5 rounded-badge bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                {customerCount} {'Shoppers'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => exportCustomersToCSV(users, orders)}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-button text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              title="Export Customers List as CSV (Excel)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={() => exportCustomersToJSON(users)}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-button text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              title="Export Customers List as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={openAddCustomerModal}
              className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded-button text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{'Add New User'}</span>
            </button>
          </div>
        </div>

        {/* Search and Role Filter - Compact */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={adminCustomerSearch}
              onChange={(e) => setAdminCustomerSearch(e.target.value)}
              placeholder={'Search by name, email, phone, or address...'}
              className="w-full h-7.5 pl-8 pr-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-input focus:bg-white focus:outline-hidden focus:border-primary text-neutral-900"
            />
          </div>

          <CustomDropdown
            value={adminCustomerRoleFilter}
            onChange={(val) => setAdminCustomerRoleFilter(val as any)}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'customer', label: 'Customers' },
              { value: 'admin', label: 'Admins' },
            ]}
            triggerClassName="h-7.5 min-w-[110px] font-bold"
            dropdownClassName="min-w-[120px]"
          />

          {adminCustomerSearch && (
            <button
              type="button"
              onClick={() => setAdminCustomerSearch('')}
              className="px-2 h-7.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Customers Table with Responsive Height */}
      <ResponsiveTableContainer showScrollCues={true}>
        <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[900px]">
          <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Customer Profile</th>
              <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Contact & Address</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">System Role</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Orders</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Total Spent</th>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  No customer accounts match your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                const userOrders = orders.filter((o) => o.userEmail.toLowerCase() === u.email.toLowerCase());
                const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
                const isCurrentUser = currentUser?.email ? currentUser.email.toLowerCase() === u.email.toLowerCase() : false;

                return (
                  <tr key={u.id} className={`hover:bg-amber-50/40 transition-colors group ${isSelected ? 'bg-amber-50/60' : ''}`}>
                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(u.id)}
                        className="rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-1.5 border-b border-r border-zinc-200 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-800 font-bold flex items-center justify-center text-2xs shrink-0 border border-zinc-200">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className="font-bold text-xs text-zinc-900 truncate flex items-center gap-1">
                            <span>{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-2xs font-bold px-1 py-0.2 bg-red-100 text-red-700 rounded-xs">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-2xs text-zinc-500 font-mono truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-1.5 border-b border-r border-zinc-200 max-w-[200px]">
                      <div className="text-xs font-semibold text-emerald-700 leading-tight">{u.phone || 'No phone'}</div>
                      <div className="text-2xs text-zinc-500 truncate mt-0.5 leading-tight" title={u.address || 'No address'}>
                        {u.address || 'No address recorded'}
                      </div>
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1 justify-center flex-wrap">
                          {u.email === 'admin@magmati.com' ? (
                            <span className="px-1.5 py-0.2 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-500 text-zinc-950 border border-amber-600 shadow-2xs">
                              SUPER ADMIN
                            </span>
                          ) : (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-2xs font-bold uppercase tracking-wider border ${
                                u.role === 'admin'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              {u.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
                            </span>
                          )}

                          {u.isSuspended && (
                            <span className="px-1.5 py-0.2 rounded-full text-2xs font-bold uppercase tracking-wider bg-red-600 text-white border border-red-700 animate-pulse">
                              SUSPENDED
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleUserRole(u.id)}
                          disabled={isCurrentUser || u.email === 'admin@magmati.com' || currentUser?.email !== 'admin@magmati.com'}
                          className="text-2xs font-bold text-zinc-500 hover:text-zinc-900 underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer"
                          title={
                            currentUser?.email !== 'admin@magmati.com' 
                              ? 'Only Super Admin can edit roles' 
                              : isCurrentUser 
                                ? 'Cannot change own role' 
                                : u.email === 'admin@magmati.com' 
                                  ? 'Cannot demote Super Admin' 
                                  : 'Switch between Admin and Customer'
                          }
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                      </div>
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center font-bold font-mono text-xs">
                      <span className={userOrders.length > 0 ? 'text-zinc-900' : 'text-zinc-400'}>
                        {userOrders.length}
                      </span>
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-right font-bold font-mono text-zinc-900 text-xs">
                      {formatBDT(totalSpent)}
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => impersonateUser(u.email, currentUser?.email || '')}
                            className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-2xs font-bold transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                            title="Act-As: Log in as this customer to inspect dashboard or cart"
                          >
                            <UserCheck className="w-2.5 h-2.5" />
                            <span>Act-As</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditCustomerModal(u)}
                          className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-2xs font-bold transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                          title="Edit user details"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>

                        {u.email !== 'admin@magmati.com' && !isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              if (u.isSuspended) {
                                reactivateUser(u.id);
                              } else {
                                suspendUser(u.id);
                              }
                            }}
                            className={`px-1.5 py-0.5 rounded text-2xs font-bold border transition-colors inline-flex items-center gap-0.5 cursor-pointer ${
                              u.isSuspended 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <span>{u.isSuspended ? 'Reactivate' : 'Suspend'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentUser || u.email === 'admin@magmati.com') {
                              return;
                            }
                            deleteUser(u.id);
                          }}
                          disabled={isCurrentUser || u.email === 'admin@magmati.com'}
                          className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-2xs font-bold transition-colors inline-flex items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Del</span>
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
    </div>
  );
};
