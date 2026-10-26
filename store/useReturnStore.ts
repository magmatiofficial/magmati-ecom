'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

export interface ReturnedItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  selectedColor?: {
    name: string;
    hex: string;
  } | null;
  selectedSize?: string | null;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  phone: string;
  email: string;
  customerName: string;
  reason: string;
  detailedReason: string;
  paymentMethod: string;
  paymentDetails: string;
  items: ReturnedItem[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  images: string[];
  createdAt: string;
  adminNotes?: string;
  potentialShippingDeduction?: number;
  shippingReview?: 'applied' | 'pending' | 'waived';
  shippingDeduction?: number;
  refundSubtotal?: number;
  refundTotal?: number;
}

interface ReturnState {
  returnRequests: ReturnRequest[];
  ownerEmail: string;
  isSyncing: boolean;
  submitReturnRequest: (request: Omit<ReturnRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  syncWithFirestore: () => (() => void) | void;
}

// Module-level reference-counted listener handles
let _returnSubscriberCount = 0;
let _activeReturnUnsubscribe: (() => void) | null = null;
let _activeReturnMode: string | null = null;

export const useReturnStore = create<ReturnState>()(
  persist(
    (set, get) => ({
      returnRequests: [],
      ownerEmail: '',
      isSyncing: false,

      syncWithFirestore: () => {
        if (typeof window === 'undefined') return () => {};

        // Dynamically retrieve useAuthStore to avoid circular dependency
        let currentUser: any = null;
        try {
          const { useAuthStore } = require('@/store/useAuthStore');
          currentUser = useAuthStore.getState().currentUser;
        } catch {}

        const userEmail = (currentUser?.email || auth.currentUser?.email || '')?.toLowerCase().trim();
        const ownerKey = userEmail;

        if (ownerKey !== '' && get().ownerEmail !== ownerKey) {
          if (_activeReturnUnsubscribe) {
            try {
              _activeReturnUnsubscribe();
            } catch {}
            _activeReturnUnsubscribe = null;
            _activeReturnMode = null;
            _returnSubscriberCount = 0;
          }
          set({ returnRequests: [], ownerEmail: ownerKey });
        }

        if (_activeReturnUnsubscribe && _activeReturnMode !== ownerKey && ownerKey !== '') {
          try {
            _activeReturnUnsubscribe();
          } catch {}
          _activeReturnUnsubscribe = null;
          _activeReturnMode = null;
          _returnSubscriberCount = 0;
        }

        // Non-admin branch: customer can only query their own returns
        if (!userEmail) {
          if (_activeReturnUnsubscribe) {
            try { _activeReturnUnsubscribe(); } catch {}
            _activeReturnUnsubscribe = null;
            _activeReturnMode = null;
            _returnSubscriberCount = 0;
          }
          return () => {};
        }

        _returnSubscriberCount++;

        if (!_activeReturnUnsubscribe) {
          try {
            const q = query(
              collection(db, 'returns'),
              where('email', '==', userEmail)
            );
            set({ isSyncing: true });

            const unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                const firestoreMap = new Map<string, ReturnRequest>();
                snapshot.forEach((docSnap) => {
                  const data = docSnap.data() as ReturnRequest;
                  if (data && data.id) {
                    firestoreMap.set(data.id, data);
                  }
                });

                // Merge into store by return ID: Firestore data wins for server fields
                const currentLocal = get().returnRequests || [];
                const mergedList: ReturnRequest[] = [];
                const seenIds = new Set<string>();

                // First merge Firestore items
                firestoreMap.forEach((fsItem, id) => {
                  const localItem = currentLocal.find((r) => r.id === id);
                  mergedList.push(localItem ? { ...localItem, ...fsItem } : fsItem);
                  seenIds.add(id);
                });

                // Keep local-only returns that are not in Firestore yet
                currentLocal.forEach((locItem) => {
                  if (!seenIds.has(locItem.id)) {
                    mergedList.push(locItem);
                  }
                });

                // Sort newest first
                mergedList.sort((a, b) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return timeB - timeA;
                });

                set({ returnRequests: mergedList, isSyncing: false });
              },
              (error) => {
                set({ isSyncing: false });
                if (
                  !error.message.includes('Disconnecting idle stream') &&
                  !error.message.includes('insufficient permissions') &&
                  error.code !== 'permission-denied'
                ) {
                  console.warn('Firestore returns sync notice:', error.message);
                }
              }
            );

            _activeReturnUnsubscribe = unsubscribe;
            _activeReturnMode = ownerKey;
          } catch (err) {
            set({ isSyncing: false });
            console.warn('Error establishing Firestore sync:', err);
          }
        }

        return () => {
          _returnSubscriberCount = Math.max(0, _returnSubscriberCount - 1);
          if (_returnSubscriberCount === 0 && _activeReturnUnsubscribe) {
            try {
              _activeReturnUnsubscribe();
            } catch {}
            _activeReturnUnsubscribe = null;
            _activeReturnMode = null;
          }
        };
      },

      submitReturnRequest: async (requestData) => {
        try {
          const token = await auth.currentUser?.getIdToken();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const res = await fetch('/api/returns/create', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestData),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to submit return request.');
          }

          const createdReturn: ReturnRequest = data.returnRequest || {
            ...requestData,
            id: data.returnId,
            createdAt: new Date().toISOString(),
            status: 'Pending',
          };

          set((state) => ({
            returnRequests: [createdReturn, ...state.returnRequests.filter((r) => r.id !== createdReturn.id)],
          }));

          return data.returnId;
        } catch (error: any) {
          console.error('Failed to persist return request:', error);
          throw error;
        }
      },
    }),
    {
      name: 'magmati-mart-return-store',
    }
  )
);
