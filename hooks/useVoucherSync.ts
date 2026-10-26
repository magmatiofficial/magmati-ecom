'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore';
import { useVoucherStore, Voucher } from '@/store/useVoucherStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchStorefront } from '@/lib/clientStorefront';

export function useVoucherSync() {
  const setVouchersFromServer = useVoucherStore((state) => state.setVouchersFromServer);
  const markVouchersLoaded = useVoucherStore((state) => state.markVouchersLoaded);
  const setMaxVouchersPerOrderFromServer = useVoucherStore((state) => state.setMaxVouchersPerOrderFromServer);
  const setVoucherUsageTotals = useVoucherStore((state) => state.setVoucherUsageTotals);
  const isAdmin = useAuthStore((s) => s.currentUser?.role === 'admin');
  const userEmail = useAuthStore((s) => s.currentUser?.email);

  useEffect(() => {
    // Admin: live listeners, so the admin panel always shows the newest data.
    if (isAdmin) {
      if (!db) {
        markVouchersLoaded();
        return;
      }

      const vouchersQuery = query(collection(db, 'vouchers'));
      const unsubVouchers = onSnapshot(
        vouchersQuery,
        (snapshot) => {
          const serverVouchers: Voucher[] = [];
          snapshot.forEach((docSnap) => {
            serverVouchers.push({ id: docSnap.id, ...docSnap.data() } as Voucher);
          });
          setVouchersFromServer(serverVouchers);
        },
        (error) => {
          console.error('[VoucherSync] Firestore vouchers subscription error:', error);
          markVouchersLoaded();
        }
      );

      const settingsRef = doc(db, 'public_settings', 'vouchers');
      const unsubSettings = onSnapshot(
        settingsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (typeof data?.maxVouchersPerOrder === 'number') {
              setMaxVouchersPerOrderFromServer(data.maxVouchersPerOrder);
            }
          }
        },
        (error) => {
          console.error('[VoucherSync] Firestore public_settings/vouchers subscription error:', error);
        }
      );

      return () => {
        unsubVouchers();
        unsubSettings();
      };
    }

    // Visitors: one shared cached request. Only if it fails, read Firestore once directly.
    let cancelled = false;
    fetchStorefront().then(async (data) => {
      if (cancelled) return;
      if (data) {
        setVouchersFromServer(data.vouchers as unknown as Voucher[]);
        if (typeof data.maxVouchersPerOrder === 'number') {
          setMaxVouchersPerOrderFromServer(data.maxVouchersPerOrder);
        }
        return;
      }
      if (!db) {
        markVouchersLoaded();
        return;
      }
      try {
        const [vouchersSnap, settingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'vouchers'))),
          getDoc(doc(db, 'public_settings', 'vouchers')),
        ]);
        if (cancelled) return;
        const serverVouchers: Voucher[] = [];
        vouchersSnap.forEach((docSnap) => {
          serverVouchers.push({ id: docSnap.id, ...docSnap.data() } as Voucher);
        });
        setVouchersFromServer(serverVouchers);
        const max = settingsSnap.exists() ? settingsSnap.data()?.maxVouchersPerOrder : undefined;
        if (typeof max === 'number') {
          setMaxVouchersPerOrderFromServer(max);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('[VoucherSync] Firestore fetch error:', error);
        markVouchersLoaded();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setVouchersFromServer, markVouchersLoaded, setMaxVouchersPerOrderFromServer, isAdmin]);

  useEffect(() => {
    if (!db || !isAdmin) {
      setVoucherUsageTotals({});
      return;
    }

    const usageCol = collection(db, 'voucher_usage');
    const unsubUsage = onSnapshot(
      usageCol,
      (snapshot) => {
        const totals: Record<string, { usedDiscountBudget: number; totalOrders: number }> = {};
        snapshot.forEach((docSnap) => {
          if (docSnap.id.endsWith('__total')) {
            const data = docSnap.data();
            const voucherId = data.voucherId || docSnap.id.slice(0, -7);
            totals[voucherId] = {
              usedDiscountBudget: Number(data.usedDiscountBudget) || 0,
              totalOrders: Number(data.totalOrders) || 0,
            };
          }
        });
        setVoucherUsageTotals(totals);
      },
      (error) => {
        console.error('[VoucherSync] Firestore voucher_usage subscription error:', error);
      }
    );

    return () => {
      unsubUsage();
    };
  }, [isAdmin, setVoucherUsageTotals]);

  const setClaimOwner = useVoucherStore((s) => s.setClaimOwner);

  useEffect(() => {
    setClaimOwner(userEmail);
  }, [userEmail, setClaimOwner]);

  useEffect(() => {
    if (userEmail) {
      useVoucherStore.getState().refreshMyVoucherUsage();
      useVoucherStore.getState().loadMyClaims();
    } else {
      useVoucherStore.getState().setMyVoucherUsage({});
      useVoucherStore.setState({ userClaimedCodes: [] });
    }
  }, [userEmail]);
}
