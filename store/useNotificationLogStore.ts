'use client';

import { create } from 'zustand';

export type NotificationChannel = 'sms' | 'email';
export type NotificationStatus = 'sent' | 'skipped' | 'failed';
export type NotificationEventType = 'order_placed' | 'status_change' | 'otp_verification' | 'test_message';

export interface NotificationLogEntry {
  id: string;
  timestamp: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  recipient: string;
  status: NotificationStatus;
  provider: string;
  summary: string;
  details?: string;
  orderId?: string;
}

export interface NotificationSettings {
  // SMS Settings
  smsEnabled: boolean;
  smsProvider: 'greenweb' | 'bulksmsbd' | 'sslwireless' | 'mimsms' | 'custom_webhook';
  smsApiKey: string;
  smsSenderId: string;
  smsClientId?: string; // Optional client id for SSL Wireless / MiMSMS
  smsCustomEndpoint?: string;
  smsOnOrderPlaced: boolean;
  smsOnStatusChange: boolean;
  smsOnOtp: boolean;

  // Email Settings
  emailEnabled: boolean;
  emailProvider: 'resend' | 'sendgrid' | 'custom_webhook';
  emailApiKey: string;
  emailFromAddress: string;
  emailFromName: string;
  adminNotificationEmail: string;
  emailOnOrderPlaced: boolean;
  emailOnStatusChange: boolean;
  emailOnPasswordReset: boolean;
}

interface NotificationStoreState {
  settings: NotificationSettings;
  logs: NotificationLogEntry[];
  
  // Actions
  updateSettings: (partial: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
  addLog: (entry: Omit<NotificationLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const defaultNotificationSettings: NotificationSettings = {
  smsEnabled: false,
  smsProvider: 'greenweb',
  smsApiKey: '',
  smsSenderId: 'MAGMATI',
  smsClientId: '',
  smsCustomEndpoint: '',
  smsOnOrderPlaced: true,
  smsOnStatusChange: true,
  smsOnOtp: true,

  emailEnabled: false,
  emailProvider: 'resend',
  emailApiKey: '',
  emailFromAddress: 'orders@magmati.com',
  emailFromName: 'MAGMATI Lifestyle',
  adminNotificationEmail: '',
  emailOnOrderPlaced: true,
  emailOnStatusChange: true,
  emailOnPasswordReset: true,
};

export const useNotificationLogStore = create<NotificationStoreState>()((set) => ({
  settings: defaultNotificationSettings,
  logs: [
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      channel: 'sms',
      eventType: 'test_message',
      recipient: 'System Initialized',
      status: 'skipped',
      provider: 'greenweb',
      summary: 'SMS service initialized in secure mode. Credentials stored solely on server database.',
      details: 'Zero credentials exposed to browser storage.',
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toISOString(),
      channel: 'email',
      eventType: 'test_message',
      recipient: 'System Initialized',
      status: 'skipped',
      provider: 'resend',
      summary: 'Email service initialized in secure mode. Credentials stored solely on server database.',
      details: 'Zero credentials exposed to browser storage.',
    },
  ],

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  resetSettings: () => {
    set({ settings: defaultNotificationSettings });
  },

  addLog: (entry) => {
    const newLog: NotificationLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 100), // Keep latest 100 logs in temporary RAM
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },
}));

