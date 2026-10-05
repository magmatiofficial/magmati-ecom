'use client';

import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import firebaseConfigRaw from '../firebase-applet-config.json';
import { type AppletFirebaseConfig } from '@/lib/firebase';

const firebaseConfig = firebaseConfigRaw as AppletFirebaseConfig;

async function getAdminHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  const currentUser = useAuthStore.getState().currentUser;
  if (currentUser?.role === 'admin' && currentUser.email) {
    headers['x-admin-email'] = currentUser.email;
  }
  return headers;
}

export interface EnvVariableConfig {
  key: string;
  nameEn: string;
  group: 'cloudinary' | 'gemini' | 'firebase' | 'courier' | 'payment' | 'oauth';
  isRequired: boolean;
  isSecret: boolean;
  value: string;
  defaultValue?: string;
  descriptionEn: string;
  guideStepsEn: string[];
  
  portalUrl?: string;
}

export interface EnvState {
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET: string;

  // Gemini AI
  GEMINI_API_KEY: string;
  GEMINI_MODEL_NAME: string;

  // Firebase
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;

  // Courier Logistics
  STEADFAST_API_KEY: string;
  STEADFAST_SECRET_KEY: string;
  REDX_API_TOKEN: string;

  // Payment Gateways
  BKASH_APP_KEY: string;
  BKASH_APP_SECRET: string;
  SSLCOMMERZ_STORE_ID: string;
  SSLCOMMERZ_STORE_PASSWORD: string;

  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // SMS Gateway
  SMS_ENABLED: string;
  SMS_PROVIDER: string;
  SMS_API_KEY: string;
  SMS_SENDER_ID: string;
  SMS_CLIENT_ID: string;
  SMS_ON_ORDER_PLACED: string;
  SMS_ON_STATUS_CHANGE: string;
  SMS_ON_OTP: string;

  // Email Gateway
  EMAIL_ENABLED: string;
  EMAIL_PROVIDER: string;
  EMAIL_API_KEY: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM_ADDRESS: string;
  EMAIL_FROM_NAME: string;
  ADMIN_NOTIFICATION_EMAIL: string;
  EMAIL_ON_ORDER_PLACED: string;
  EMAIL_ON_STATUS_CHANGE: string;
  EMAIL_ON_PASSWORD_RESET: string;

  // Meta
  isSaving: boolean;
  isLoaded: boolean;
  savingKey: string | null;
  dirtyKeys: Record<string, boolean>;

  // Actions
  updateEnvVar: (key: string, value: string) => void;
  updateBulkEnvVars: (updates: Record<string, string>) => void;
  resetEnvVars: () => void;
  getFormattedEnvFileString: () => string;
  saveEnvVarsToDatabase: () => Promise<{ success: boolean; message?: string }>;
  saveSingleEnvVar: (key: string) => Promise<{ success: boolean; message?: string }>;
  saveGroupEnvVars: (groupKeys: string[]) => Promise<{ success: boolean; message?: string }>;
  fetchEnvVarsFromDatabase: (retryCount?: number) => Promise<void>;
}

const defaultEnvValues = {
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'magmati',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'magmati_preset',

  GEMINI_API_KEY: '',
  GEMINI_MODEL_NAME: 'gemini-2.5-flash',

  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey || '',
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || '',
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId || '',
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '',
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId || '',

  STEADFAST_API_KEY: '',
  STEADFAST_SECRET_KEY: '',
  REDX_API_TOKEN: '',

  BKASH_APP_KEY: '',
  BKASH_APP_SECRET: '',
  SSLCOMMERZ_STORE_ID: '',
  SSLCOMMERZ_STORE_PASSWORD: '',

  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: '',

  SMS_ENABLED: 'false',
  SMS_PROVIDER: 'greenweb',
  SMS_API_KEY: '',
  SMS_SENDER_ID: 'MAGMATI',
  SMS_CLIENT_ID: '',
  SMS_ON_ORDER_PLACED: 'true',
  SMS_ON_STATUS_CHANGE: 'true',
  SMS_ON_OTP: 'true',

  EMAIL_ENABLED: 'false',
  EMAIL_PROVIDER: 'resend',
  EMAIL_API_KEY: '',
  SMTP_HOST: '',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASS: '',
  EMAIL_FROM_ADDRESS: 'orders@magmati.com',
  EMAIL_FROM_NAME: 'MAGMATI Lifestyle',
  ADMIN_NOTIFICATION_EMAIL: '',
  EMAIL_ON_ORDER_PLACED: 'true',
  EMAIL_ON_STATUS_CHANGE: 'true',
  EMAIL_ON_PASSWORD_RESET: 'true',

  isSaving: false,
  isLoaded: false,
  savingKey: null,
  dirtyKeys: {} as Record<string, boolean>,
};

export const useEnvConfigStore = create<EnvState>()(
  (set, get) => ({
      ...defaultEnvValues,

      updateEnvVar: (key, value) => {
        set((state) => ({ 
          ...state, 
          [key]: value,
          dirtyKeys: { ...state.dirtyKeys, [key]: true }
        }));
      },

      updateBulkEnvVars: (updates) => {
        const dirtyMap = { ...get().dirtyKeys };
        Object.keys(updates).forEach((k) => { dirtyMap[k] = true; });
        set((state) => ({ ...state, ...updates, dirtyKeys: dirtyMap }));
      },

      resetEnvVars: () => {
        set(() => ({ ...defaultEnvValues, dirtyKeys: {} }));
      },

      fetchEnvVarsFromDatabase: async (retryCount = 0) => {
        try {
          const headers = await getAdminHeaders();
          const res = await fetch('/api/admin/env-config', { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.envData) {
              set((state) => {
                // Preserve keys that the user is actively modifying locally
                const dirtyKeys = state.dirtyKeys || {};
                const safeEnvData = { ...data.envData };
                Object.keys(dirtyKeys).forEach((k) => {
                  if (dirtyKeys[k]) {
                    delete safeEnvData[k];
                  }
                });
                return { ...state, ...safeEnvData, isLoaded: true };
              });
            }
          } else {
            // If server returned non-ok (like 502/503 during hot-reload), retry up to 3 times
            if (retryCount < 3) {
              setTimeout(() => {
                get().fetchEnvVarsFromDatabase(retryCount + 1);
              }, 3000);
            }
          }
        } catch (e) {
          // If network error (such as during hot-reloads when the server restarts), retry silently
          if (retryCount < 3) {
            setTimeout(() => {
              get().fetchEnvVarsFromDatabase(retryCount + 1);
            }, 3000);
          } else {
            console.debug('Failed to load env vars from db (server may be recompiling):', e);
          }
        }
      },

      saveSingleEnvVar: async (key: string) => {
        set({ savingKey: key });
        try {
          const state = get();
          const val = state[key as keyof EnvState];
          const payload = { [key]: val };
          const headers = await getAdminHeaders();

          const res = await fetch('/api/admin/env-config', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          const newDirty = { ...get().dirtyKeys };
          delete newDirty[key];
          set({ savingKey: null, dirtyKeys: newDirty });

          if (res.ok) {
            return { success: true, message: `${key} saved and applied successfully` };
          } else {
            return { success: false, message: 'Server error saving variable' };
          }
        } catch (err: any) {
          set({ savingKey: null });
          return { success: false, message: err.message || 'Network error' };
        }
      },

      saveGroupEnvVars: async (groupKeys: string[]) => {
        set({ isSaving: true });
        try {
          const state = get();
          const payload: Record<string, any> = {};
          groupKeys.forEach((k) => {
            payload[k] = state[k as keyof EnvState];
          });
          const headers = await getAdminHeaders();

          const res = await fetch('/api/admin/env-config', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          const newDirty = { ...get().dirtyKeys };
          groupKeys.forEach((k) => delete newDirty[k]);
          set({ isSaving: false, dirtyKeys: newDirty });

          if (res.ok) {
            return { success: true, message: 'Section credentials saved & applied' };
          } else {
            return { success: false, message: 'Failed to save section' };
          }
        } catch (err: any) {
          set({ isSaving: false });
          return { success: false, message: err.message || 'Network error' };
        }
      },

      saveEnvVarsToDatabase: async () => {
        set({ isSaving: true });
        try {
          const state = get();
          const keysToSave = {
            CLOUDINARY_CLOUD_NAME: state.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: state.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: state.CLOUDINARY_API_SECRET,
            CLOUDINARY_UPLOAD_PRESET: state.CLOUDINARY_UPLOAD_PRESET,

            GEMINI_API_KEY: state.GEMINI_API_KEY,
            GEMINI_MODEL_NAME: state.GEMINI_MODEL_NAME,

            FIREBASE_API_KEY: state.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: state.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: state.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: state.FIREBASE_STORAGE_BUCKET,
            FIREBASE_MESSAGING_SENDER_ID: state.FIREBASE_MESSAGING_SENDER_ID,
            FIREBASE_APP_ID: state.FIREBASE_APP_ID,

            STEADFAST_API_KEY: state.STEADFAST_API_KEY,
            STEADFAST_SECRET_KEY: state.STEADFAST_SECRET_KEY,
            REDX_API_TOKEN: state.REDX_API_TOKEN,

            BKASH_APP_KEY: state.BKASH_APP_KEY,
            BKASH_APP_SECRET: state.BKASH_APP_SECRET,
            SSLCOMMERZ_STORE_ID: state.SSLCOMMERZ_STORE_ID,
            SSLCOMMERZ_STORE_PASSWORD: state.SSLCOMMERZ_STORE_PASSWORD,

            GOOGLE_CLIENT_ID: state.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: state.GOOGLE_CLIENT_SECRET,

            SMS_ENABLED: state.SMS_ENABLED,
            SMS_PROVIDER: state.SMS_PROVIDER,
            SMS_API_KEY: state.SMS_API_KEY,
            SMS_SENDER_ID: state.SMS_SENDER_ID,
            SMS_CLIENT_ID: state.SMS_CLIENT_ID,
            SMS_ON_ORDER_PLACED: state.SMS_ON_ORDER_PLACED,
            SMS_ON_STATUS_CHANGE: state.SMS_ON_STATUS_CHANGE,
            SMS_ON_OTP: state.SMS_ON_OTP,

            EMAIL_ENABLED: state.EMAIL_ENABLED,
            EMAIL_PROVIDER: state.EMAIL_PROVIDER,
            EMAIL_API_KEY: state.EMAIL_API_KEY,
            SMTP_HOST: state.SMTP_HOST,
            SMTP_PORT: state.SMTP_PORT,
            SMTP_USER: state.SMTP_USER,
            SMTP_PASS: state.SMTP_PASS,
            EMAIL_FROM_ADDRESS: state.EMAIL_FROM_ADDRESS,
            EMAIL_FROM_NAME: state.EMAIL_FROM_NAME,
            ADMIN_NOTIFICATION_EMAIL: state.ADMIN_NOTIFICATION_EMAIL,
            EMAIL_ON_ORDER_PLACED: state.EMAIL_ON_ORDER_PLACED,
            EMAIL_ON_STATUS_CHANGE: state.EMAIL_ON_STATUS_CHANGE,
            EMAIL_ON_PASSWORD_RESET: state.EMAIL_ON_PASSWORD_RESET,
          };
          const headers = await getAdminHeaders();

          const res = await fetch('/api/admin/env-config', {
            method: 'POST',
            headers,
            body: JSON.stringify(keysToSave),
          });

          set({ isSaving: false, dirtyKeys: {} });
          if (res.ok) {
            const result = await res.json();
            return { success: true, message: result.message };
          } else {
            return { success: false, message: 'Server error saving settings' };
          }
        } catch (error: any) {
          set({ isSaving: false });
          return { success: false, message: error.message || 'Network error' };
        }
      },

      getFormattedEnvFileString: () => {
        const state = get();
        return `# ==============================================================================
# MAGMATI ATELIER - ENVIRONMENT CONFIGURATION (.env)
# Generated dynamically from Admin Credentials Control Center
# ==============================================================================

# 1. Cloudinary Image & Video CDN Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${state.CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=${state.CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=${state.CLOUDINARY_API_SECRET}
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${state.CLOUDINARY_UPLOAD_PRESET}

# 2. Google Gemini AI Engine
GEMINI_API_KEY=${state.GEMINI_API_KEY}
GEMINI_MODEL_NAME=${state.GEMINI_MODEL_NAME}

# 3. Firebase & Firestore Database Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=${state.FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${state.FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${state.FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${state.FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${state.FIREBASE_MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${state.FIREBASE_APP_ID}

# 4. Steadfast & RedX Courier Logistics API Keys
STEADFAST_API_KEY=${state.STEADFAST_API_KEY}
STEADFAST_SECRET_KEY=${state.STEADFAST_SECRET_KEY}
REDX_API_TOKEN=${state.REDX_API_TOKEN}

# 5. Payment Gateway Credentials
BKASH_APP_KEY=${state.BKASH_APP_KEY}
BKASH_APP_SECRET=${state.BKASH_APP_SECRET}
SSLCOMMERZ_STORE_ID=${state.SSLCOMMERZ_STORE_ID}
SSLCOMMERZ_STORE_PASSWORD=${state.SSLCOMMERZ_STORE_PASSWORD}

# 6. Google Workspace & OAuth Login Credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${state.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${state.GOOGLE_CLIENT_SECRET}

# 7. SMS Gateway Credentials
SMS_ENABLED=${state.SMS_ENABLED}
SMS_PROVIDER=${state.SMS_PROVIDER}
SMS_API_KEY=${state.SMS_API_KEY}
SMS_SENDER_ID=${state.SMS_SENDER_ID}
SMS_CLIENT_ID=${state.SMS_CLIENT_ID}
SMS_ON_ORDER_PLACED=${state.SMS_ON_ORDER_PLACED}
SMS_ON_STATUS_CHANGE=${state.SMS_ON_STATUS_CHANGE}
SMS_ON_OTP=${state.SMS_ON_OTP}

# 8. Email Notification Gateway Credentials (Resend, SendGrid, or Nodemailer SMTP)
EMAIL_ENABLED=${state.EMAIL_ENABLED}
EMAIL_PROVIDER=${state.EMAIL_PROVIDER}
EMAIL_API_KEY=${state.EMAIL_API_KEY}
SMTP_HOST=${state.SMTP_HOST}
SMTP_PORT=${state.SMTP_PORT}
SMTP_USER=${state.SMTP_USER}
SMTP_PASS=${state.SMTP_PASS}
EMAIL_FROM_ADDRESS=${state.EMAIL_FROM_ADDRESS}
EMAIL_FROM_NAME=${state.EMAIL_FROM_NAME}
ADMIN_NOTIFICATION_EMAIL=${state.ADMIN_NOTIFICATION_EMAIL}
EMAIL_ON_ORDER_PLACED=${state.EMAIL_ON_ORDER_PLACED}
EMAIL_ON_STATUS_CHANGE=${state.EMAIL_ON_STATUS_CHANGE}
EMAIL_ON_PASSWORD_RESET=${state.EMAIL_ON_PASSWORD_RESET}
`;
      },
  })
);
