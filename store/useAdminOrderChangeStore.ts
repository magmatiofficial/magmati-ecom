/**
 * @file store/useAdminOrderChangeStore.ts
 * @description In-memory Zustand store for publishing order changes across admin views without reloading full collection.
 */

import { create } from 'zustand';
import type { Order } from '@/store/useOrderStore';

export interface OrderChangePayload {
  orderId: string;
  patch: Partial<Order>;
  nonce: number;
}

interface AdminOrderChangeState {
  lastChange: OrderChangePayload | null;
  publishOrderChange: (orderId: string, patch: Partial<Order>) => void;
}

let nonceCounter = 0;

export const useAdminOrderChangeStore = create<AdminOrderChangeState>((set) => ({
  lastChange: null,
  publishOrderChange: (orderId: string, patch: Partial<Order>) => {
    nonceCounter += 1;
    set({
      lastChange: {
        orderId,
        patch,
        nonce: nonceCounter,
      },
    });
  },
}));
