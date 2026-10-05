'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth, sanitizeForFirestore } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
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
  isSyncing: boolean;
  submitReturnRequest: (request: Omit<ReturnRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateReturnStatus: (id: string, status: ReturnRequest['status'], adminNotes?: string, shippingReview?: ReturnRequest['shippingReview'], shippingDeduction?: number) => Promise<void>;
  resolveShippingReview: (id: string, decision: 'waived' | 'applied') => Promise<void>;
  deleteReturnRequest: (id: string) => Promise<void>;
  syncWithFirestore: () => (() => void) | void;
}

// Module-level reference-counted listener handles
let _returnSubscriberCount = 0;
let _activeReturnUnsubscribe: (() => void) | null = null;

export const useReturnStore = create<ReturnState>()(
  persist(
    (set, get) => ({
      returnRequests: [],
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
        const isAdmin = currentUser?.role === 'admin';

        // Admin branch: subscribe to full returns collection
        if (isAdmin) {
          _returnSubscriberCount++;

          if (!_activeReturnUnsubscribe) {
            try {
              const returnsCol = collection(db, 'returns');
              set({ isSyncing: true });
              
              const unsubscribe = onSnapshot(returnsCol, (snapshot) => {
                if (!snapshot.empty) {
                  const firestoreReturns: ReturnRequest[] = [];
                  snapshot.forEach((docSnap) => {
                    const data = docSnap.data() as ReturnRequest;
                    if (data && data.id) {
                      firestoreReturns.push(data);
                    }
                  });
                  
                  // Sort newest first
                  firestoreReturns.sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                  });

                  set({ returnRequests: firestoreReturns, isSyncing: false });
                } else {
                  set({ returnRequests: [], isSyncing: false });
                }
              }, (error) => {
                set({ isSyncing: false });
                if (
                  !error.message.includes('Disconnecting idle stream') &&
                  !error.message.includes('insufficient permissions') &&
                  error.code !== 'permission-denied'
                ) {
                  console.warn('Firestore returns sync notice:', error.message);
                }
              });

              _activeReturnUnsubscribe = unsubscribe;
            } catch (err) {
              set({ isSyncing: false });
              console.warn('Error establishing Firestore sync:', err);
            }
          }

          return () => {
            _returnSubscriberCount = Math.max(0, _returnSubscriberCount - 1);
            if (_returnSubscriberCount === 0 && _activeReturnUnsubscribe) {
              _activeReturnUnsubscribe();
              _activeReturnUnsubscribe = null;
            }
          };
        }

        // Non-admin branch: customer can only query their own returns
        if (!userEmail) {
          if (_activeReturnUnsubscribe) {
            try { _activeReturnUnsubscribe(); } catch {}
            _activeReturnUnsubscribe = null;
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
          } catch (err) {
            set({ isSyncing: false });
            console.warn('Error establishing Firestore sync:', err);
          }
        }

        return () => {
          _returnSubscriberCount = Math.max(0, _returnSubscriberCount - 1);
          if (_returnSubscriberCount === 0 && _activeReturnUnsubscribe) {
            _activeReturnUnsubscribe();
            _activeReturnUnsubscribe = null;
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

      updateReturnStatus: async (id, status, adminNotes, shippingReview, shippingDeduction) => {
        const currentDoc = get().returnRequests.find(r => r.id === id);
        let calculatedRefundTotal = currentDoc?.refundTotal;

        if (status === 'Rejected') {
          calculatedRefundTotal = 0;
        } else {
          // If status is Pending / Approved / Completed (or re-approved from Rejected)
          const subtotal = currentDoc?.refundSubtotal ?? (currentDoc?.items?.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0) || 0);
          const effectiveDeduction = shippingDeduction !== undefined
            ? shippingDeduction
            : (currentDoc?.shippingReview === 'waived' ? 0 : (currentDoc?.shippingDeduction ?? (currentDoc?.potentialShippingDeduction || 0)));
          calculatedRefundTotal = Math.max(0, subtotal - effectiveDeduction);
        }

        // Immediate local state update
        set((state) => ({
          returnRequests: state.returnRequests.map((r) =>
            r.id === id
              ? { 
                  ...r, 
                  status, 
                  adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
                  shippingReview: shippingReview !== undefined ? shippingReview : r.shippingReview,
                  shippingDeduction: shippingDeduction !== undefined ? shippingDeduction : r.shippingDeduction,
                  refundTotal: calculatedRefundTotal
                }
              : r
          ),
        }));

        // Update in Firestore
        try {
          const returnDocRef = doc(db, 'returns', id);
          const updatePayload: Record<string, any> = { 
            status,
            refundTotal: calculatedRefundTotal
          };
          if (adminNotes !== undefined) {
            updatePayload.adminNotes = adminNotes;
          }
          if (shippingReview !== undefined) {
            updatePayload.shippingReview = shippingReview;
          }
          if (shippingDeduction !== undefined) {
            updatePayload.shippingDeduction = shippingDeduction;
          }
          await updateDoc(returnDocRef, updatePayload);
        } catch (error) {
          console.error('Failed to update return request in Firestore:', error);
        }
      },

      resolveShippingReview: async (id, decision) => {
        const currentReq = get().returnRequests.find((r) => r.id === id);
        if (!currentReq) return;

        const subtotal = currentReq.refundSubtotal || currentReq.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
        const potential = currentReq.potentialShippingDeduction || 0;

        const shippingReview = decision;
        const shippingDeduction = decision === 'waived' ? 0 : potential;
        const refundTotal = Math.max(0, subtotal - shippingDeduction);

        // Update locally
        set((state) => ({
          returnRequests: state.returnRequests.map((r) =>
            r.id === id
              ? { ...r, shippingReview, shippingDeduction, refundTotal, refundSubtotal: subtotal }
              : r
          ),
        }));

        // Update Firestore
        try {
          const docRef = doc(db, 'returns', id);
          await updateDoc(docRef, {
            shippingReview,
            shippingDeduction,
            refundTotal,
            refundSubtotal: subtotal,
          });
        } catch (error) {
          console.error('Failed to resolve shipping review in Firestore:', error);
        }
      },

      deleteReturnRequest: async (id) => {
        // Immediate local removal
        set((state) => ({
          returnRequests: state.returnRequests.filter((r) => r.id !== id),
        }));

        // Delete from Firestore
        try {
          const returnDocRef = doc(db, 'returns', id);
          await deleteDoc(returnDocRef);
        } catch (error) {
          console.error('Failed to delete return request from Firestore:', error);
        }
      },
    }),
    {
      name: 'magmati-mart-return-store',
    }
  )
);
