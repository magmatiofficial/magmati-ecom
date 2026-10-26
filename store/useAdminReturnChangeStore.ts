/**
 * @file store/useAdminReturnChangeStore.ts
 * @description In-memory Zustand store for publishing return request changes across admin views without reloading full collection.
 */

import { create } from 'zustand';

export interface ReturnChangePayload {
  returnId: string;
  nonce: number;
}

interface AdminReturnChangeState {
  lastChange: ReturnChangePayload | null;
  publishReturnChange: (returnId: string) => void;
}

let nonceCounter = 0;

export const useAdminReturnChangeStore = create<AdminReturnChangeState>((set) => ({
  lastChange: null,
  publishReturnChange: (returnId: string) => {
    nonceCounter += 1;
    set({
      lastChange: {
        returnId,
        nonce: nonceCounter,
      },
    });
  },
}));
