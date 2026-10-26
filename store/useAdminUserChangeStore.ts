/**
 * @file store/useAdminUserChangeStore.ts
 * @description In-memory Zustand store for publishing user changes across admin views without reloading full collection.
 */

import { create } from 'zustand';

export interface UserChangePayload {
  userId: string;
  nonce: number;
}

interface AdminUserChangeState {
  lastChange: UserChangePayload | null;
  publishUserChange: (userId: string) => void;
}

let nonceCounter = 0;

export const useAdminUserChangeStore = create<AdminUserChangeState>((set) => ({
  lastChange: null,
  publishUserChange: (userId: string) => {
    nonceCounter += 1;
    set({
      lastChange: {
        userId,
        nonce: nonceCounter,
      },
    });
  },
}));
