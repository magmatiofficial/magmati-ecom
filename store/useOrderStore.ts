'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useProductStore } from '@/store/useProductStore';
import { dispatchStatusNotification } from '@/lib/notificationEngine';
import { db, auth } from '@/lib/firebase';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import { 
  collection, 
  onSnapshot, 
  query,
  where 
} from 'firebase/firestore';

import { fetchAdminOrderById } from '@/lib/orders/fetchAdminOrderById';

export const WIPE_CONFIRM_PHRASE = 'DELETE ALL ORDERS';

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: {
    name: string;
    hex: string;
  };
  customPrice?: number;
  isFreeItem?: boolean;
  isComboItem?: boolean;
  comboId?: string;
  promoLabel?: string;
}

export interface Order {
  id: string;
  userEmail: string;
  userName: string;
  date: string;
  createdAt: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus?: 'cod_due' | 'awaiting_verification' | 'awaiting_gateway' | 'paid' | 'failed';
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  shippingFee?: number;
  discount?: number;
  discountAmount?: number;
  appliedCoupon?: string;
  appliedCoupons?: string[];
  payment: string;
  paymentMethod?: string;
  trxId?: string;
  phone: string;
  address: string;
  district?: string;
  orderNotes?: string;
  courier?: string;
  courierBooked?: string;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  isSyncing: boolean;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'createdAt' | 'status'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  verifyOrderPayment: (orderId: string, decision: 'verify' | 'reject') => Promise<{ cancelled: boolean }>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
  syncWithFirestore: () => (() => void) | void;
  fetchOrderHistory: () => Promise<void>;
}

// Module-level reference-counted listener handles
let _orderSubscriberCount = 0;
let _activeOrderUnsubscribe: (() => void) | null = null;

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isSyncing: false,

      fetchOrderHistory: async () => {
        try {
          // Admin Act-As: the Firebase session is the admin's; the customer's orders come from the Firestore listener, never overwrite them with the admin's own history.
          try {
            const { useAuthStore } = require('@/store/useAuthStore');
            const cu = useAuthStore.getState().currentUser;
            if (cu?.impersonatingFromAdminEmail) return;
          } catch {}

          const { auth } = await import('@/lib/firebase');
          
          if (typeof (auth as any).authStateReady === 'function') {
            await (auth as any).authStateReady();
          }

          let user = auth.currentUser;
          if (!user) {
            user = await new Promise<any>((resolve) => {
              const unsubscribe = auth.onAuthStateChanged((u) => {
                if (u) {
                  unsubscribe();
                  resolve(u);
                } else {
                  setTimeout(() => {
                    unsubscribe();
                    resolve(auth.currentUser);
                  }, 400);
                }
              });
            });
          }

          if (!user) {
            // Unauthenticated guest user - do not overwrite local state
            return;
          }

          const token = await user.getIdToken().catch(() => null);
          if (!token) return;

          set({ isSyncing: true });

          const allLoadedServerOrders: Order[] = [];
          let currentCursor: string | null = null;
          let hasMorePages = true;
          let pageCount = 0;
          const MAX_PAGES = 10;

          while (hasMorePages && pageCount < MAX_PAGES) {
            pageCount++;
            let url = '/api/orders/history?limit=50';
            if (currentCursor) {
              url += `&cursor=${encodeURIComponent(currentCursor)}`;
            }

            const res = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              cache: 'no-store'
            });

            if (!res.ok) {
              set({ isSyncing: false });
              return;
            }

            const data = await res.json();
            if (!data || data.success !== true || !Array.isArray(data.orders)) {
              set({ isSyncing: false });
              return;
            }

            allLoadedServerOrders.push(...data.orders);
            hasMorePages = Boolean(data.hasMore);
            currentCursor = data.nextCursor || null;

            if (!currentCursor) {
              break;
            }
          }

          set((state) => {
            const serverOrders: Order[] = allLoadedServerOrders;
            const serverOrderIds = new Set(serverOrders.map((o) => o.id));

            let currentUser: any = null;
            try {
              const { useAuthStore } = require('@/store/useAuthStore');
              currentUser = useAuthStore.getState().currentUser;
            } catch {}

            const userEmailLower = (user?.email || currentUser?.email || '').toLowerCase().trim();
            const userPhoneClean = (currentUser?.phone || '').replace(/[\s-+]/g, '').replace(/^88/, '');

            const now = Date.now();
            const THREE_MINUTES_MS = 3 * 60 * 1000;

            const filteredLocalOrders = state.orders.filter((o) => {
              // If it's already on the server, handled by serverOrders base
              if (serverOrderIds.has(o.id)) return false;

              const emailMatch = userEmailLower && o.userEmail && o.userEmail.toLowerCase().trim() === userEmailLower;
              const orderPhoneClean = o.phone ? o.phone.replace(/[\s-+]/g, '').replace(/^88/, '') : '';
              const phoneMatch = userPhoneClean && orderPhoneClean && userPhoneClean === orderPhoneClean;
              const isCurrentUserOrder = Boolean(emailMatch || phoneMatch);

              if (isCurrentUserOrder) {
                // Match found: keep ONLY if it is less than 3 minutes old
                const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
                return (now - orderTime) < THREE_MINUTES_MS;
              }

              // Not a server order and not a recent match for this user -> discard
              return false;
            });

            const merged = [...serverOrders, ...filteredLocalOrders];
            merged.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });

            return { orders: merged, isSyncing: false };
          });
        } catch (err) {
          set({ isSyncing: false });
          console.warn('Error fetching order history:', err);
        }
      },

      syncWithFirestore: () => {
        if (typeof window === 'undefined') return () => {};

        // Dynamically retrieve useAuthStore to avoid circular dependency
        let currentUser: any = null;
        try {
          const { useAuthStore } = require('@/store/useAuthStore');
          currentUser = useAuthStore.getState().currentUser;
        } catch {}

        const userEmail = (currentUser?.email || auth.currentUser?.email || '')?.toLowerCase().trim();

        // Own-orders branch: every signed-in user (including admins) only listens to their own orders. The admin panel reads orders from the server APIs (paged and aggregated).
        if (!userEmail) {
          if (_activeOrderUnsubscribe) {
            try { _activeOrderUnsubscribe(); } catch {}
            _activeOrderUnsubscribe = null;
            _orderSubscriberCount = 0;
          }
          if (currentUser) {
            get().fetchOrderHistory();
          }
          return () => {};
        }

        _orderSubscriberCount++;

        if (!_activeOrderUnsubscribe) {
          try {
            const q = query(
              collection(db, 'orders'),
              where('userEmail', '==', userEmail)
            );
            set({ isSyncing: true });

            const unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                if (!snapshot.empty) {
                  const firestoreOrders: Order[] = [];
                  snapshot.forEach((docSnap) => {
                    const data = docSnap.data() as Order;
                    if (data && data.id) {
                      firestoreOrders.push(data);
                    }
                  });
                  
                  // Sort newest first
                  firestoreOrders.sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                  });

                  set({ orders: firestoreOrders, isSyncing: false });
                } else {
                  if (snapshot.metadata.fromCache) {
                    // Empty cache/offline snapshot: keep server-loaded orders, wait for the server snapshot or fetchOrderHistory
                    return;
                  }
                  set({ orders: [], isSyncing: false });
                }
              },
              (error) => {
                set({ isSyncing: false });
                if (
                  !error.message.includes('Disconnecting idle stream') &&
                  !error.message.includes('insufficient permissions') &&
                  error.code !== 'permission-denied'
                ) {
                  console.warn('Firestore orders sync notice:', error.message);
                }
              }
            );

            _activeOrderUnsubscribe = unsubscribe;
          } catch (err) {
            set({ isSyncing: false });
            console.warn('Error establishing Firestore sync:', err);
          }
        }

        return () => {
          _orderSubscriberCount = Math.max(0, _orderSubscriberCount - 1);
          if (_orderSubscriberCount === 0 && _activeOrderUnsubscribe) {
            _activeOrderUnsubscribe();
            _activeOrderUnsubscribe = null;
          }
        };
      },

      addOrder: async (orderData) => {
        const { auth } = await import('@/lib/firebase');
        const token = await auth.currentUser?.getIdToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create order on server.');
        }

        const data = await res.json();
        if (!data.success || !data.order) {
          throw new Error(data.error || 'Invalid server order response.');
        }

        const serverOrder: Order = data.order;
        set((state) => ({
          orders: [serverOrder, ...state.orders.filter((o) => o.id !== serverOrder.id)],
        }));

        useAnalyticsStore.getState().logAction('PLACE_ORDER', { 
          orderId: serverOrder.id, 
          total: serverOrder.total, 
          itemsCount: serverOrder.items.length 
        });

        return serverOrder.id;
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/orders/update-status', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              orderId,
              status,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errorMessage = errData.error || 'Failed to update order status';
            throw new Error(errorMessage);
          }

          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId
                ? { ...o, status }
                : o
            ),
          }));
        } catch (error: any) {
          throw new Error(error?.message || 'Failed to update order status due to network error');
        }
      },

      verifyOrderPayment: async (orderId, decision) => {
        try {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              orderId,
              decision,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errorMessage = errData.error || 'Failed to verify payment';
            throw new Error(errorMessage);
          }

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to verify payment');
          }

          const VALID_STATUSES: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

          if (data.paymentStatus) {
            set((state) => ({
              orders: state.orders.map((o) => {
                if (o.id !== orderId) return o;
                const updated: Order = { ...o, paymentStatus: data.paymentStatus };
                if (data.status && VALID_STATUSES.includes(data.status)) {
                  updated.status = data.status;
                }
                return updated;
              }),
            }));
          }

          return { cancelled: data.cancelled === true };
        } catch (error: any) {
          throw new Error(error?.message || 'Failed to verify payment');
        }
      },

      deleteOrder: async (orderId) => {
        let order = get().orders.find((o) => o.id === orderId);

        if (!order) {
          const fetched = await fetchAdminOrderById(orderId);
          if (fetched.ok) {
            order = fetched.order;
          } else if (!fetched.notFound) {
            throw new Error('Could not verify the order status before deletion. The order was NOT deleted.');
          }
        }

        if (
          order &&
          (order.status === 'Pending' ||
            order.status === 'Processing' ||
            order.status === 'Shipped' ||
            (order.status as string) === 'Dispatched')
        ) {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          let res: Response;
          try {
            res = await fetch('/api/orders/update-status', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                orderId,
                status: 'Cancelled',
              }),
            });
          } catch (err: any) {
            throw new Error(`Failed to cancel order before deletion. Order was NOT deleted: ${err?.message || 'Network error'}`);
          }

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`Failed to cancel order before deletion. Order was NOT deleted: ${errData?.error || res.statusText || 'Update failed'}`);
          }
        }

        const res = await authedFetchJson<{
          success?: boolean;
          deleted?: string[];
          missing?: string[];
          failed?: { id: string; reason: string }[];
          error?: string;
        }>('/api/admin/orders/delete', {
          method: 'POST',
          body: JSON.stringify({ ids: [orderId] }),
        });

        if (!res.ok || !res.data || res.data.success !== true) {
          throw new Error(res.data?.error || 'Failed to delete order on the server. The order was NOT deleted.');
        }

        if (Array.isArray(res.data.failed) && res.data.failed.some((f) => f.id === orderId)) {
          throw new Error('This order is still active and was NOT deleted. Cancel it first.');
        }

        const deletedList = res.data.deleted || [];
        const missingList = res.data.missing || [];

        if (deletedList.includes(orderId) || missingList.includes(orderId)) {
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== orderId),
          }));
        } else {
          throw new Error('Failed to delete order on the server. The order was NOT deleted.');
        }
      },

      clearAllOrders: async () => {
        let remaining = true;
        let iterations = 0;

        while (remaining && iterations < 50) {
          iterations++;
          const res = await authedFetchJson<{
            success?: boolean;
            remaining?: boolean;
            error?: string;
          }>('/api/admin/orders/wipe', {
            method: 'POST',
            body: JSON.stringify({ confirm: WIPE_CONFIRM_PHRASE }),
          });

          if (res.status === 429) {
            throw new Error('Too many requests. Wait one minute and try again; progress so far is kept.');
          }

          if (!res.ok || !res.data || res.data.success !== true) {
            throw new Error(res.data?.error || 'Failed to wipe orders on the server.');
          }

          if (res.data.remaining === false) {
            remaining = false;
            break;
          }
        }

        if (remaining) {
          throw new Error('Wipe is not finished yet. Run it again to continue.');
        }

        set({ orders: [] });
      },
    }),
    {
      name: 'magmati-mart-order-store-v2',
      partialize: () => ({}),
    }
  )
);
