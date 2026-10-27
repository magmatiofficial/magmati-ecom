'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Search, UserCheck, Edit, Trash2, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { exportCustomersToCSV, exportCustomersToJSON } from '@/lib/dataTransferUtils';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/useToastStore';
import { auth } from '@/lib/firebase';
import { useAdminCustomerOrderStats } from '@/hooks/useAdminCustomerOrderStats';
import { fetchCustomerOrderStats } from '@/lib/orders/fetchCustomerOrderStats';
import { useAdminUsersPage } from '@/hooks/useAdminUsersPage';
import { fetchAllAdminUsers, setAdminUserRoleApi, setAdminUserSuspendedApi, deleteAdminUserApi } from '@/lib/users/userApi';
import { useAdminUserChangeStore } from '@/store/useAdminUserChangeStore';
import type { AdminUserView } from '@/lib/users/userFilters';

interface CustomersTabProps {
  adminCustomerSearch: string;
  setAdminCustomerSearch: (val: string) => void;
  adminCustomerRoleFilter: 'All' | 'customer' | 'admin';
  setAdminCustomerRoleFilter: (val: 'All' | 'customer' | 'admin') => void;
  openAddCustomerModal: () => void;
  currentUser: { email: string } | null;
  impersonateUser: (email: string, currentEmail: string, profile?: AdminUserView) => void;
  openEditCustomerModal: (user: AdminUserView) => void;
  formatBDT: (amount: number, lang?: any) => string;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  adminCustomerSearch,
  setAdminCustomerSearch,
  adminCustomerRoleFilter,
  setAdminCustomerRoleFilter,
  openAddCustomerModal,
  currentUser,
  impersonateUser,
  openEditCustomerModal,
  formatBDT,
}) => {
  const {
    users,
    counts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    refreshCounts,
    patchUser,
    removeUser,
  } = useAdminUsersPage({
    role: adminCustomerRoleFilter,
    search: adminCustomerSearch,
  });

  const lastChange = useAdminUserChangeStore((s) => s.lastChange);
  const nonceRef = useRef<number>(lastChange?.nonce ?? 0);
  useEffect(() => {
    if (lastChange && lastChange.nonce !== nonceRef.current) {
      nonceRef.current = lastChange.nonce;
      refresh();
      refreshCounts();
    }
  }, [lastChange, refresh, refreshCounts]);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    setSelectedUserIds((prev) => prev.filter((id) => users.some((u) => u.id === id)));
  }, [users]);

  useEffect(() => {
    let mounted = true;
    async function checkSuperAdmin() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch('/api/auth/sync-role', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => null);
        if (mounted && data && data.isSuperAdmin === true) {
          setIsSuperAdmin(true);
        }
      } catch (err) {
        // ignore
      }
    }
    checkSuperAdmin();
    return () => {
      mounted = false;
    };
  }, []);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const totalUsers = counts?.total ?? '—';
  const adminCount = counts?.admins ?? '—';
  const customerCount = counts?.customers ?? '—';

  const { stats: orderStats } = useAdminCustomerOrderStats(users.map((u) => u.email));

  const toggleSelectAll = () => {
    if (users.length > 0 && selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((i) => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) return;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    for (const id of selectedUserIds) {
      const u = users.find((user) => user.id === id);
      if (!u) continue;
      const isCurrentUser = currentUser?.email ? currentUser.email.toLowerCase() === u.email.toLowerCase() : false;
      if (u.isSuspended || isCurrentUser || u.isSuperAdmin || (u.role === 'admin' && !isSuperAdmin)) {
        skipped++;
        continue;
      }
      const res = await setAdminUserSuspendedApi(u.email, true);
      if (res.ok && res.user) {
        patchUser(u.id, res.user);
        success++;
      } else {
        failed++;
      }
    }
    if (failed > 0) {
      toast.error(`${success} suspended, ${failed} failed, ${skipped} skipped.`);
    } else if (success > 0) {
      toast.success(`${success} customer(s) suspended${skipped ? `, ${skipped} skipped` : ''}.`);
    } else {
      toast.error('Nothing to suspend: the selected accounts are already suspended or protected.');
    }
    setSelectedUserIds([]);
    refreshCounts();
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;
    if (!isSuperAdmin) {
      toast.error('Only the main admin can delete users.');
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: `Delete ${selectedUserIds.length} Customers`,
      message: `Are you sure you want to permanently delete these ${selectedUserIds.length} selected customer accounts? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        let successCount = 0;
        let failCount = 0;
        try {
          for (const id of selectedUserIds) {
            const u = users.find((user) => user.id === id);
            if (!u) continue;
            const isCurrentUser = currentUser?.email ? currentUser.email.toLowerCase() === u.email.toLowerCase() : false;
            if (isCurrentUser || u.isSuperAdmin) {
              failCount++;
              continue;
            }
            const res = await deleteAdminUserApi(u.email);
            if (res.ok) {
              removeUser(u.id);
              successCount++;
            } else {
              failCount++;
            }
          }
          if (failCount > 0) {
            toast.error(`${successCount} deleted, ${failCount} failed.`);
          } else if (successCount > 0) {
            toast.success(`${successCount} customers deleted successfully.`);
          }
          setSelectedUserIds([]);
          refreshCounts();
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch {
          toast.error('Failed to delete some customers.');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const openSingleDeleteConfirm = (user: AdminUserView) => {
    if (!isSuperAdmin) {
      toast.error('Only the main admin can delete users.');
      return;
    }
    setConfirmDialog({
      open: true,
      title: `Delete Customer: ${user.name}`,
      message: `Are you sure you want to permanently delete the account for ${user.name} (${user.email})?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const res = await deleteAdminUserApi(user.email);
          if (res.ok) {
            removeUser(user.id);
            refreshCounts();
            toast.success(`Customer "${user.name}" deleted successfully.`);
          } else {
            toast.error(!res.ok ? res.error : 'Failed to delete customer.');
          }
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch {
          toast.error('Failed to delete customer.');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
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
              disabled={isExportingCsv}
              onClick={async () => {
                setIsExportingCsv(true);
                try {
                  const all = await fetchAllAdminUsers();
                  if (!all.ok) {
                    toast.error(all.error);
                    return;
                  }
                  const result = await fetchCustomerOrderStats(all.users.map((u) => u.email));
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  exportCustomersToCSV(all.users, result.stats);
                } finally {
                  setIsExportingCsv(false);
                }
              }}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-button text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Export Customers List as CSV (Excel)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExportingCsv ? 'Exporting...' : 'CSV'}</span>
            </button>

            <button
              type="button"
              disabled={isExportingCsv}
              onClick={async () => {
                setIsExportingCsv(true);
                try {
                  const all = await fetchAllAdminUsers();
                  if (!all.ok) {
                    toast.error(all.error);
                    return;
                  }
                  exportCustomersToJSON(all.users);
                } finally {
                  setIsExportingCsv(false);
                }
              }}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-button text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Export Customers List as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                refresh();
                refreshCounts();
              }}
              className="p-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-button text-xs font-bold transition-colors inline-flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
              title="Refresh Customers List"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
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
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative flex-1 basis-full sm:basis-0 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={adminCustomerSearch}
              onChange={(e) => setAdminCustomerSearch(e.target.value)}
              placeholder={'Exact email or phone...'}
              className="w-full h-7.5 pl-8 pr-2.5 bg-neutral-50 border border-neutral-200 rounded-input focus:bg-white focus:outline-hidden focus:border-primary text-neutral-900"
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

      {error && (
        <InlineAlert type="error">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={() => refresh()}>
              Retry
            </Button>
          </div>
        </InlineAlert>
      )}

      {selectedUserIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 px-3 flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900">{selectedUserIds.length} customer(s) selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkSuspend}>
              Bulk Suspend
            </Button>
            {isSuperAdmin && (
              <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                Bulk Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Customers Table with Responsive Height */}
      <ResponsiveTableContainer showScrollCues={true}>
        <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[900px]">
          <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-2.5 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-10 text-center">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUserIds.length === users.length}
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
            {isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                  No customer accounts match your criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                const stat = u.email ? orderStats[u.email.toLowerCase()] : undefined;
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
                          {u.avatarLetter || u.name.charAt(0).toUpperCase() || '?'}
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
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-2xs font-bold uppercase tracking-wider border ${
                              u.role === 'admin'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {u.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
                          </span>

                          {u.isSuspended && (
                            <span className="px-1.5 py-0.2 rounded-full text-2xs font-bold uppercase tracking-wider bg-red-600 text-white border border-red-700 animate-pulse">
                              SUSPENDED
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const newRole = u.role === 'admin' ? 'customer' : 'admin';
                            const res = await setAdminUserRoleApi(u.email, newRole);
                            if (res.ok && res.user) {
                              patchUser(u.id, res.user);
                              toast.success(`${u.name} is now ${newRole === 'admin' ? 'an Admin' : 'a Customer'}.`);
                              refreshCounts();
                            } else {
                              toast.error(!res.ok ? res.error : 'Failed to update role.');
                            }
                          }}
                          disabled={isCurrentUser || !isSuperAdmin || u.isSuperAdmin}
                          className="text-2xs font-bold text-zinc-500 hover:text-zinc-900 underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer"
                          title={
                            u.isSuperAdmin
                              ? 'Protected account'
                              : !isSuperAdmin
                                ? 'Only the main admin can edit roles'
                                : isCurrentUser
                                  ? 'Cannot change own role'
                                  : 'Switch between Admin and Customer'
                          }
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>
                      </div>
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center font-bold font-mono text-xs">
                      <span className={stat && stat.orders > 0 ? 'text-zinc-900' : 'text-zinc-400'}>
                        {stat ? stat.orders : '—'}
                      </span>
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-right font-bold font-mono text-zinc-900 text-xs">
                      {stat ? formatBDT(stat.spent) : '—'}
                    </td>

                    <td className="px-2.5 py-1.5 border-b border-r border-zinc-200 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => impersonateUser(u.email, currentUser?.email || '', u)}
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

                        {!isCurrentUser && !(u.role === 'admin' && !isSuperAdmin) && !u.isSuperAdmin && (
                          <button
                            type="button"
                            onClick={async () => {
                              const targetSuspended = !u.isSuspended;
                              const res = await setAdminUserSuspendedApi(u.email, targetSuspended);
                              if (res.ok && res.user) {
                                patchUser(u.id, res.user);
                                toast.success(`Customer ${res.user.isSuspended ? 'suspended' : 'reactivated'}.`);
                                refreshCounts();
                              } else {
                                toast.error(!res.ok ? res.error : 'Failed to update suspension status.');
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
                          onClick={() => openSingleDeleteConfirm(u)}
                          disabled={isCurrentUser || !isSuperAdmin || u.isSuperAdmin}
                          className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-2xs font-bold transition-colors inline-flex items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={u.isSuperAdmin ? 'Protected account' : !isSuperAdmin ? 'Only the main admin can delete users' : 'Delete Customer'}
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

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            size="sm"
            variant="outline"
            loading={isLoadingMore}
            onClick={() => loadMore()}
          >
            Load more
          </Button>
        </div>
      )}

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmLabel={confirmDialog.confirmLabel || 'Delete'}
        cancelLabel={confirmDialog.cancelLabel || 'Cancel'}
        loading={isConfirmLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};
