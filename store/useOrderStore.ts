'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useProductStore } from '@/store/useProductStore';
import { dispatchStatusNotification } from '@/lib/notificationEngine';
import { db, auth, sanitizeForFirestore, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';

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
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  shippingFee?: number;
  discount?: number;
  discountAmount?: number;
  appliedCoupon?: string;
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
  deleteOrder: (orderId: string) => Promise<void>;
  clearAllOrders: () => Promise<void>;
  syncWithFirestore: () => (() => void) | void;
  clearMockOrders: () => void;
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
          const res = await fetch('/api/orders/history', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
              set((state) => {
                const serverOrders: Order[] = data.orders;
                const serverOrderIds = new Set(serverOrders.map((o) => o.id));

                let currentUser: any = null;
                try {
                  const { useAuthStore } = require('@/store/useAuthStore');
                  currentUser = useAuthStore.getState().currentUser;
                } catch {}

                const userEmailLower = (user?.email || currentUser?.email || '').toLowerCase().trim();
                const userPhoneClean = (currentUser?.phone || '').replace(/[\s-+]/g, '').replace(/^88/, '');

                const localUserOrders = state.orders.filter((o) => {
                  if (serverOrderIds.has(o.id)) return false;
                  const emailMatch = userEmailLower && o.userEmail && o.userEmail.toLowerCase().trim() === userEmailLower;
                  const orderPhoneClean = o.phone ? o.phone.replace(/[\s-+]/g, '').replace(/^88/, '') : '';
                  const phoneMatch = userPhoneClean && orderPhoneClean && userPhoneClean === orderPhoneClean;
                  return Boolean(emailMatch || phoneMatch);
                });

                const mergedMap = new Map<string, Order>();
                for (const o of serverOrders) {
                  mergedMap.set(o.id, o);
                }
                for (const o of localUserOrders) {
                  if (!mergedMap.has(o.id)) {
                    mergedMap.set(o.id, o);
                  }
                }

                const merged = Array.from(mergedMap.values());
                merged.sort((a, b) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return timeB - timeA;
                });

                return { orders: merged, isSyncing: false };
              });
            } else {
              set({ isSyncing: false });
            }
          } else {
            set({ isSyncing: false });
          }
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

        const isAdmin = currentUser?.role === 'admin';

        // Non-admin users (customers & guests) must never subscribe to full orders collection
        if (!isAdmin) {
          if (_activeOrderUnsubscribe) {
            try { _activeOrderUnsubscribe(); } catch {}
            _activeOrderUnsubscribe = null;
            _orderSubscriberCount = 0;
          }
          if (currentUser) {
            // Registered non-admin customer: fetch via secure, token-verified API
            get().fetchOrderHistory();
          }
          return () => {};
        }
        
        _orderSubscriberCount++;

        if (!_activeOrderUnsubscribe) {
          try {
            const ordersCol = collection(db, 'orders');
            set({ isSyncing: true });
            
            // Initial snapshot listener for real-time order status updates across sessions
            const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
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
                set({ orders: [], isSyncing: false });
              }
            }, (error) => {
              set({ isSyncing: false });
              // Only log actual unexpected errors, ignore permission denials for non-admins and idle stream notices
              if (
                !error.message.includes('Disconnecting idle stream') &&
                !error.message.includes('insufficient permissions') &&
                error.code !== 'permission-denied'
              ) {
                console.warn('Firestore orders sync notice:', error.message);
              }
            });

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

      clearMockOrders: () => {
        set((state) => ({
          orders: state.orders.filter(
            (o) => o.id !== 'MGM-942819' && o.id !== 'MGM-829143'
          ),
        }));
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
        
        // Attempt safe background sync to client Firestore
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db, sanitizeForFirestore } = await import('@/lib/firebase');
          setDoc(doc(db, 'orders', serverOrder.id), sanitizeForFirestore(serverOrder)).catch(() => {});
        } catch {
          // Handled gracefully
        }

        useAnalyticsStore.getState().logAction('PLACE_ORDER', { 
          orderId: serverOrder.id, 
          total: serverOrder.total, 
          itemsCount: serverOrder.items.length 
        });

        return serverOrder.id;
      },

      updateOrderStatus: async (orderId, status) => {
        const currentOrder = get().orders.find((o) => o.id === orderId);

        // Immediate local state update for snappy UI
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status }
              : o
          ),
        }));

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
            console.warn('Server status update notice:', errData.error);
          }
        } catch (error) {
          console.warn('Failed to call update-status endpoint:', error);
        }
      },

      deleteOrder: async (orderId) => {
        // Immediate local removal
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));

        // Delete from Firestore
        try {
          const orderDocRef = doc(db, 'orders', orderId);
          await deleteDoc(orderDocRef);
        } catch (error) {
          console.error('Failed to delete order from Firestore:', error);
        }
      },

      clearAllOrders: async () => {
        set({ orders: [] });

        try {
          const ordersCol = collection(db, 'orders');
          const snapshot = await getDocs(ordersCol);
          const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
          await Promise.all(deletions);
        } catch (err) {
          console.warn('Failed to clear orders from Firestore:', err);
        }
      },
    }),
    {
      name: 'magmati-mart-order-store',
      // Ensure mock orders are filtered out on initial hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.orders = state.orders.filter(
            (o) => o.id !== 'MGM-942819' && o.id !== 'MGM-829143'
          );
        }
      },
    }
  )
);
