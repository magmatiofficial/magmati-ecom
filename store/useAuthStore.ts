'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { db, auth, sanitizeForFirestore } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';

export interface SavedAddress {
  id: string;
  title: string; // e.g. "Home", "Office", "Parents' House"
  recipientName: string;
  phone: string;
  districtId: string; // e.g. "dhaka"
  address: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
  savedAddresses?: SavedAddress[];
  avatarLetter: string;
  avatarUrl?: string;
  isSuspended?: boolean;
  securityPin?: string;
  impersonatingFromAdminEmail?: string;
  password?: string;
  resetCode?: string;
  resetCodeExpiresAt?: number;
  createdAt?: string;
}

export type User = UserProfile;

interface AuthState {
  users: UserProfile[];
  currentUser: UserProfile | null;
  fetchUsers: () => Promise<void>;
  registerUser: (name: string, email: string, phone: string, address: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; cancelled?: boolean }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; resetCode?: string; error?: string }>;
  resetPasswordWithCode: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, role: 'admin' | 'customer') => void;
  addUser: (data: { name: string; email: string; phone?: string; address?: string; role: 'admin' | 'customer' }) => Promise<{ success: boolean; error?: string }>;
  updateUserDetails: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  reactivateUser: (userId: string) => Promise<void>;
  setSecurityPin: (userId: string, pin: string) => Promise<void>;
  impersonateUser: (userEmail: string, adminEmail: string) => void;
  exitImpersonation: () => { success: boolean; error?: string };
  addSavedAddress: (addressData: Omit<SavedAddress, 'id'>) => Promise<void>;
  updateSavedAddress: (addressId: string, addressData: Partial<SavedAddress>) => Promise<void>;
  deleteSavedAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'admin-1',
          name: 'Atelier Admin',
          email: 'admin@example.com',
          role: 'admin',
          phone: '+880 1999-888777',
          address: 'HQ, Gulshan 2, Dhaka',
          avatarLetter: 'A',
        },
        {
          id: 'user-1',
          name: 'Asif Rahman',
          email: 'user@example.com',
          role: 'customer',
          phone: '+880 1712-345678',
          address: 'House 24, Road 11, Block D, Banani, Dhaka-1213, Bangladesh',
          avatarLetter: 'AR',
        },
      ],
      currentUser: null,

      fetchUsers: async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const fetchedUsers: UserProfile[] = [];
          querySnapshot.forEach((docSnap) => {
            fetchedUsers.push(docSnap.data() as UserProfile);
          });
          
          if (fetchedUsers.length > 0) {
            set({ users: fetchedUsers });
          }
        } catch (e: any) {
          // Ignore expected permission denial for non-admin guests
          if (!e?.message?.includes('permission') && !e?.code?.includes('permission-denied')) {
            console.warn("Notice fetching users from Firestore:", e);
          }
        }
      },

      registerUser: async (name, email, phone, address, password) => {
        const emailLower = email.toLowerCase().trim();
        const pwd = password || '';

        if (!pwd || pwd.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        }

        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        // 1. Authoritatively create Firebase Auth account
        try {
          await createUserWithEmailAndPassword(auth, emailLower, pwd);
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            return { success: false, error: 'This email is already registered. Please log in.' };
          }
          if (authErr.code === 'auth/weak-password') {
            return { success: false, error: 'Password must be at least 6 characters long.' };
          }
          return { success: false, error: authErr.message || 'Failed to create account in authentication system.' };
        }

        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name,
          email: emailLower,
          role: 'customer',
          phone,
          address,
          avatarLetter: initials || 'U',
          isSuspended: false,
          createdAt: new Date().toISOString(),
        };

        try {
          // Save profile to Firestore cloud database
          await setDoc(doc(db, 'users', emailLower), newUser);
        } catch (error: any) {
          console.warn("Firestore registerUser profile notice:", error);
        }

        useAnalyticsStore.getState().identifyVisitor(name, emailLower);
        useAnalyticsStore.getState().logAction('REGISTER', { email: emailLower });

        set((state) => ({
          users: [...state.users.filter((u) => u.email !== emailLower), newUser],
          currentUser: newUser,
        }));

        return { success: true };
      },

      loginUser: async (email, password) => {
        const emailLower = (email || '').toLowerCase().trim();
        const pwd = password || '';

        if (!emailLower || !pwd) {
          return { success: false, error: 'Email and password are required.' };
        }

        // 1. Authenticate authoritatively with Firebase Auth
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, emailLower, pwd);
        } catch (fbErr: any) {
          const errCode = fbErr?.code || '';
          if (errCode === 'auth/user-not-found' || errCode === 'auth/wrong-password' || errCode === 'auth/invalid-credential') {
            return { success: false, error: 'Incorrect email or password.' };
          }
          return { success: false, error: fbErr?.message || 'Authentication failed. Please check your credentials.' };
        }

        // 2. Fetch or create authoritative user profile & role from Firestore
        let found: UserProfile | null = get().users.find((u) => u.email.toLowerCase() === emailLower) || null;
        try {
          const userDocRef = doc(db, 'users', emailLower);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            found = userDoc.data() as UserProfile;
          } else {
            // Seed customer profile if not yet created in Firestore
            found = found || {
              id: userCredential.user.uid || `usr-${Date.now()}`,
              name: 'Valued Customer',
              email: emailLower,
              role: 'customer',
              phone: '+880 1712-345678',
              address: 'Dhaka, Bangladesh',
              avatarLetter: 'U',
              isSuspended: false,
            };
            try { await setDoc(userDocRef, found); } catch {}
          }
        } catch (dbErr) {
          console.warn('Firestore profile fetch notice:', dbErr);
        }

        if (!found) {
          found = {
            id: userCredential.user.uid || `usr-${Date.now()}`,
            name: emailLower.split('@')[0],
            email: emailLower,
            role: 'customer',
            avatarLetter: emailLower[0].toUpperCase(),
            isSuspended: false,
          };
        }

        // 3. Sync verified role securely with server
        try {
          const idToken = await userCredential.user.getIdToken();
          if (idToken) {
            const res = await fetch('/api/auth/sync-role', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${idToken}`,
                'Content-Type': 'application/json',
              },
            });
            if (res.ok) {
              const data = await res.json();
              console.info('[RoleSync]', data.role, data.reason);
              if (data?.role) {
                found.role = data.role;
              }
            }
          }
        } catch (syncErr) {
          console.warn('Role sync network notice:', syncErr);
        }

        if (found.isSuspended) {
          auth.signOut().catch(() => {});
          return { success: false, error: 'Your account has been suspended by the administrator. Please contact support@magmati.com' };
        }

        useAnalyticsStore.getState().identifyVisitor(found.name, found.email);
        useAnalyticsStore.getState().logAction('LOGIN', { email: found.email });

        set((state) => ({
          currentUser: found,
          users: [...state.users.filter((u) => u.email !== found!.email), found!],
        }));

        return { success: true };
      },

      loginWithGoogle: async () => {
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const gUser = userCredential.user;

          if (!gUser.email) {
            return { success: false, error: 'Google Sign-In did not return an email address.' };
          }

          const emailLower = gUser.email.toLowerCase().trim();
          const userDocRef = doc(db, 'users', emailLower);
          const userDoc = await getDoc(userDocRef);

          let finalUser: UserProfile;

          if (userDoc.exists()) {
            finalUser = userDoc.data() as UserProfile;
          } else {
            const initials = (gUser.displayName || 'Google User')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            finalUser = {
              id: `gusr-${gUser.uid}`,
              name: gUser.displayName || 'Google User',
              email: emailLower,
              role: 'customer',
              phone: gUser.phoneNumber || '',
              address: '',
              avatarLetter: initials || 'G',
              avatarUrl: gUser.photoURL || undefined,
              isSuspended: false,
            };

            await setDoc(userDocRef, finalUser);
          }

          // Sync verified role securely with server
          try {
            const idToken = await gUser.getIdToken();
            if (idToken) {
              const res = await fetch('/api/auth/sync-role', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${idToken}`,
                  'Content-Type': 'application/json',
                },
              });
              if (res.ok) {
                const data = await res.json();
                console.info('[RoleSync]', data.role, data.reason);
                if (data?.role) {
                  finalUser.role = data.role;
                }
              }
            }
          } catch (syncErr) {
            console.warn('Role sync network notice:', syncErr);
          }

          if (finalUser.isSuspended) {
            return { success: false, error: 'Your account has been suspended by the administrator. Please contact support@magmati.com' };
          }

          useAnalyticsStore.getState().identifyVisitor(finalUser.name, finalUser.email);
          useAnalyticsStore.getState().logAction('LOGIN_GOOGLE', { email: finalUser.email });

          set((state) => ({
            currentUser: finalUser,
            users: [...state.users.filter((u) => u.email !== finalUser.email), finalUser],
          }));

          return { success: true };
        } catch (error: any) {
          const errCode = (error?.code || '').toLowerCase();
          const errMsg = (error?.message || '').toLowerCase();
          
          // If the user intentionally dismissed the popup, treat as a clean cancellation rather than an error
          if (
            errCode.includes('popup-closed-by-user') ||
            errMsg.includes('popup-closed-by-user') ||
            errCode.includes('cancelled-popup-request') ||
            errMsg.includes('cancelled-popup-request') ||
            errCode.includes('user-cancelled') ||
            errMsg.includes('user-cancelled') ||
            errMsg.includes('popup closed') ||
            errMsg.includes('window closed') ||
            errMsg.includes('closed by user')
          ) {
            return { success: false, cancelled: true };
          }

          console.warn("Google Sign-In notice:", error);
          let friendlyError = 'Google Sign-In failed.';
          
          if (errCode.includes('popup-blocked') || errMsg.includes('popup-blocked') || errMsg.includes('popup blocked')) {
            friendlyError = 'The Google sign-in window was blocked by your browser. Please allow popups or open this app in a new tab to sign in.';
          } else if (errCode.includes('network-request-failed') || errMsg.includes('network')) {
            friendlyError = 'A network connection issue occurred. Please check your internet and try again.';
          } else if (error && error.message) {
            friendlyError = error.message;
          }
          return { success: false, error: friendlyError };
        }
      },

      requestPasswordReset: async (email: string) => {
        const emailLower = (email || '').toLowerCase().trim();
        if (!emailLower) {
          return { success: false, error: 'Please enter a valid email address.' };
        }

        try {
          const res = await fetch('/api/auth/password-reset/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailLower }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            return { success: false, error: data.error || 'Failed to request password reset code.' };
          }
        } catch (error: any) {
          console.warn('Password reset server route notice:', error);
        }

        try {
          await sendPasswordResetEmail(auth, emailLower);
        } catch {}

        useAnalyticsStore.getState().logAction('REQUEST_PASSWORD_RESET', { email: emailLower });

        return {
          success: true,
        };
      },

      resetPasswordWithCode: async (email: string, resetCode: string, newPassword: string) => {
        const emailLower = (email || '').toLowerCase().trim();

        if (!emailLower || !newPassword || !resetCode) {
          return { success: false, error: 'All fields are required.' };
        }

        if (newPassword.length < 4) {
          return { success: false, error: 'New password must be at least 4 characters long.' };
        }

        try {
          const res = await fetch('/api/auth/password-reset/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: emailLower,
              resetCode: resetCode.trim(),
              newPassword,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            return { success: false, error: data.error || 'Invalid or expired verification code.' };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to verify reset code.' };
        }

        // Update local state
        set((state) => ({
          users: state.users.map((u) =>
            u.email.toLowerCase() === emailLower
              ? { ...u, password: newPassword }
              : u
          ),
          currentUser:
            state.currentUser?.email.toLowerCase() === emailLower
              ? { ...state.currentUser, password: newPassword }
              : state.currentUser,
        }));

        useAnalyticsStore.getState().logAction('PASSWORD_RESET_SUCCESS', { email: emailLower });

        return { success: true };
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { currentUser } = get();
        if (!currentUser) {
          return { success: false, error: 'You must be signed in to change your password.' };
        }

        if (newPassword.length < 6) {
          return { success: false, error: 'New password must be at least 6 characters long.' };
        }

        if (!auth.currentUser) {
          return { success: false, error: 'Active authentication session not found. Please log in again.' };
        }

        try {
          // 1. Authoritatively update password in Firebase Auth (Never silently diverge)
          await updatePassword(auth.currentUser, newPassword);
        } catch (authErr: any) {
          console.error('Firebase Auth password update failed:', authErr);
          if (authErr.code === 'auth/requires-recent-login') {
            return { success: false, error: 'This operation is sensitive and requires recent authentication. Please log in again before retrying.' };
          }
          return { success: false, error: authErr.message || 'Failed to update authentication credentials.' };
        }

        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), { updatedAt: new Date().toISOString() });

          useAnalyticsStore.getState().logAction('PASSWORD_CHANGED', { email: emailLower });

          return { success: true };
        } catch (error: any) {
          console.warn('Profile timestamp update notice:', error);
          return { success: true };
        }
      },

      logoutUser: () => {
        if (auth) {
          auth.signOut().catch(() => {});
        }
        useAnalyticsStore.getState().logAction('LOGOUT');
        set({ currentUser: null });
      },

      updateProfile: async (updatedData) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        
        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), updatedData);
          
          const updatedUser = { ...currentUser, ...updatedData };
          const updatedUsersList = users.map((u) =>
            u.id === currentUser.id ? { ...u, ...updatedData } : u
          );

          set({
            currentUser: updatedUser,
            users: updatedUsersList,
          });
        } catch (e) {
          console.error("Error updating profile in Firestore:", e);
        }
      },

      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
          currentUser: state.currentUser?.id === userId ? null : state.currentUser,
        }));
      },

      updateUserRole: (userId, role) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, role } : u)),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, role } : state.currentUser,
        }));
      },

      addUser: async (data) => {
        const emailLower = data.email.toLowerCase().trim();
        try {
          const userDocRef = doc(db, 'users', emailLower);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            return { success: false, error: 'User with this email already exists' };
          }
          const initials = data.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const newUser: UserProfile = {
            id: `usr-${Date.now()}`,
            name: data.name,
            email: emailLower,
            role: data.role,
            phone: data.phone || '',
            address: data.address || '',
            avatarLetter: initials || 'U',
            isSuspended: false,
          };

          await setDoc(doc(db, 'users', emailLower), newUser);

          set((state) => ({
            users: [...state.users.filter((u) => u.email !== emailLower), newUser],
          }));

          return { success: true, error: '' };
        } catch (error: any) {
          return { success: false, error: error.message || 'Error adding user.' };
        }
      },

      updateUserDetails: async (userId, data) => {
        const { users, currentUser } = get();
        const target = users.find((u) => u.id === userId);
        if (!target) return;

        try {
          await updateDoc(doc(db, 'users', target.email.toLowerCase()), data);
          
          set({
            users: users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
            currentUser: currentUser?.id === userId ? { ...currentUser, ...data } : currentUser,
          });
        } catch (e) {
          console.error("Error updating user details in Firestore:", e);
        }
      },

      suspendUser: async (userId) => {
        const { users, currentUser } = get();
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        try {
          await updateDoc(doc(db, 'users', targetUser.email.toLowerCase()), { isSuspended: true });
          useAnalyticsStore.getState().logAction('SUSPEND_USER', { targetId: userId, email: targetUser.email });

          const isCurrentUser = currentUser?.id === userId;
          set({
            users: users.map((u) => (u.id === userId ? { ...u, isSuspended: true } : u)),
            currentUser: isCurrentUser ? null : currentUser,
          });
        } catch (e) {
          console.error("Error suspending user in Firestore:", e);
        }
      },

      reactivateUser: async (userId) => {
        const { users } = get();
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        try {
          await updateDoc(doc(db, 'users', targetUser.email.toLowerCase()), { isSuspended: false });
          useAnalyticsStore.getState().logAction('REACTIVATE_USER', { targetId: userId, email: targetUser.email });

          set({
            users: users.map((u) => (u.id === userId ? { ...u, isSuspended: false } : u)),
          });
        } catch (e) {
          console.error("Error reactivating user in Firestore:", e);
        }
      },

      setSecurityPin: async (userId, pin) => {
        const { users, currentUser } = get();
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) return;

        try {
          await updateDoc(doc(db, 'users', targetUser.email.toLowerCase()), { securityPin: pin });
          set({
            users: users.map((u) => (u.id === userId ? { ...u, securityPin: pin } : u)),
            currentUser: currentUser?.id === userId ? { ...currentUser, securityPin: pin } : currentUser,
          });
        } catch (e) {
          console.error("Error setting security pin in Firestore:", e);
        }
      },

      impersonateUser: (userEmail, adminEmail) => {
        set((state) => {
          const found = state.users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());
          if (!found) return state;

          const impersonatedUser: UserProfile = {
            ...found,
            impersonatingFromAdminEmail: adminEmail,
          };

          useAnalyticsStore.getState().logAction('IMPERSONATION_START', { admin: adminEmail, target: userEmail });

          return {
            currentUser: impersonatedUser,
          };
        });
      },

      exitImpersonation: () => {
        let result: { success: boolean; error?: string } = { success: false };
        set((state) => {
          if (!state.currentUser?.impersonatingFromAdminEmail) {
            result = { success: false, error: 'Not currently impersonating.' };
            return state;
          }

          const adminEmail = state.currentUser.impersonatingFromAdminEmail;
          const adminUser = state.users.find((u) => u.email.toLowerCase() === adminEmail.toLowerCase());

          if (!adminUser) {
            result = { success: false, error: 'Original admin user not found.' };
            return state;
          }

          result = { success: true };
          useAnalyticsStore.getState().logAction('IMPERSONATION_EXIT', { admin: adminEmail });

          return {
            currentUser: adminUser,
          };
        });
        return result;
      },

      addSavedAddress: async (addressData) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        let currentAddresses = currentUser.savedAddresses ? [...currentUser.savedAddresses] : [];

        // If no saved addresses array exists yet, but a single profile address exists, convert it into the first saved address card
        if (currentAddresses.length === 0 && currentUser.address) {
          currentAddresses.push({
            id: 'addr-initial-default',
            title: 'Home Address',
            recipientName: currentUser.name || 'Valued Customer',
            phone: currentUser.phone || '',
            districtId: 'dhaka',
            address: currentUser.address,
            isDefault: true,
          });
        }

        const setAsDefault = currentAddresses.length === 0 || Boolean(addressData.isDefault);

        const newAddr: SavedAddress = {
          ...addressData,
          id: `addr-${Date.now()}`,
          isDefault: setAsDefault,
        };

        const updatedAddresses = currentAddresses.map((a) =>
          setAsDefault ? { ...a, isDefault: false } : a
        );
        updatedAddresses.push(newAddr);

        const updatedData: Partial<UserProfile> = {
          savedAddresses: updatedAddresses,
        };

        const primaryAddr = updatedAddresses.find((a) => a.isDefault) || updatedAddresses[0];
        if (primaryAddr) {
          updatedData.address = primaryAddr.address;
          if (primaryAddr.phone) updatedData.phone = primaryAddr.phone;
        }

        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), updatedData);
        } catch (e) {
          console.warn("Error updating saved addresses in Firestore:", e);
        }

        const updatedUser = { ...currentUser, ...updatedData };
        set({
          currentUser: updatedUser,
          users: users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        });
      },

      updateSavedAddress: async (addressId, addressData) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const currentAddresses = currentUser.savedAddresses || [];
        const isMakingDefault = Boolean(addressData.isDefault);

        const updatedAddresses = currentAddresses.map((a) => {
          if (a.id === addressId) {
            return { ...a, ...addressData, isDefault: isMakingDefault ? true : a.isDefault };
          }
          if (isMakingDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });

        const updatedData: Partial<UserProfile> = {
          savedAddresses: updatedAddresses,
        };

        const targetAddr = updatedAddresses.find((a) => a.id === addressId);
        if (targetAddr?.isDefault) {
          updatedData.address = targetAddr.address;
          if (targetAddr.phone) updatedData.phone = targetAddr.phone;
        }

        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), updatedData);
        } catch (e) {
          console.warn("Error updating saved address in Firestore:", e);
        }

        const updatedUser = { ...currentUser, ...updatedData };
        set({
          currentUser: updatedUser,
          users: users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        });
      },

      deleteSavedAddress: async (addressId) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const currentAddresses = currentUser.savedAddresses || [];
        const target = currentAddresses.find((a) => a.id === addressId);
        const filtered = currentAddresses.filter((a) => a.id !== addressId);

        if (target?.isDefault && filtered.length > 0) {
          filtered[0].isDefault = true;
        }

        const defaultAddr = filtered.find((a) => a.isDefault) || filtered[0];
        const updatedData: Partial<UserProfile> = {
          savedAddresses: filtered,
        };
        if (defaultAddr) {
          updatedData.address = defaultAddr.address;
          if (defaultAddr.phone) updatedData.phone = defaultAddr.phone;
        }

        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), updatedData);
        } catch (e) {
          console.warn("Error deleting saved address from Firestore:", e);
        }

        const updatedUser = { ...currentUser, ...updatedData };
        set({
          currentUser: updatedUser,
          users: users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        });
      },

      setDefaultAddress: async (addressId) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const currentAddresses = currentUser.savedAddresses || [];
        const target = currentAddresses.find((a) => a.id === addressId);
        if (!target) return;

        const updatedAddresses = currentAddresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }));

        const updatedData: Partial<UserProfile> = {
          savedAddresses: updatedAddresses,
          address: target.address,
          phone: target.phone || currentUser.phone,
        };

        try {
          const emailLower = currentUser.email.toLowerCase().trim();
          await updateDoc(doc(db, 'users', emailLower), updatedData);
        } catch (e) {
          console.warn("Error setting default address in Firestore:", e);
        }

        const updatedUser = { ...currentUser, ...updatedData };
        set({
          currentUser: updatedUser,
          users: users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
        });
      },
    }),
    {
      name: 'magmati-mart-auth-store',
    }
  )
);
