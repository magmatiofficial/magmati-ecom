'use client';

import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  AlertCircle 
} from 'lucide-react';

interface EnvGroupFieldsProps {
  groupId: string;
  store: any;
  showSecretMap: Record<string, boolean>;
  toggleShowSecret: (key: string) => void;
  handleCopyText: (text: string, label: string) => void;
  copiedKey: string | null;
}

const KEY_METADATA: Record<string, {
  isUrgent: boolean;
  descEn: string;
  defaultVal?: string;
}> = {
  CLOUDINARY_CLOUD_NAME: {
    isUrgent: true,
    descEn: "Cloud name identifier for uploading product images to Cloudinary.",
    defaultVal: "magmati"
  },
  CLOUDINARY_UPLOAD_PRESET: {
    isUrgent: true,
    descEn: "Unsigned upload preset name configured in Cloudinary console.",
    defaultVal: "magmati_preset"
  },
  CLOUDINARY_API_KEY: {
    isUrgent: true,
    descEn: "API Key for secure communication with your Cloudinary console."
  },
  CLOUDINARY_API_SECRET: {
    isUrgent: true,
    descEn: "API Secret for secure image deletes and secure server-side operations."
  },
  GEMINI_API_KEY: {
    isUrgent: true,
    descEn: "Google Gemini API key for AI fashion copywriter and recommendation system."
  },
  FIREBASE_API_KEY: {
    isUrgent: true,
    descEn: "Core web API key for initializing secure Firebase operations."
  },
  FIREBASE_PROJECT_ID: {
    isUrgent: true,
    descEn: "Unique identifier for your Google Firebase project configuration."
  },
  FIREBASE_AUTH_DOMAIN: {
    isUrgent: true,
    descEn: "Authentication handler domain for client session management."
  },
  FIREBASE_STORAGE_BUCKET: {
    isUrgent: true,
    descEn: "Cloud storage address for media/binary files inside Firebase."
  },
  FIREBASE_MESSAGING_SENDER_ID: {
    isUrgent: false,
    descEn: "Sender identification for client push notifications (FCM)."
  },
  FIREBASE_APP_ID: {
    isUrgent: true,
    descEn: "Unique client web application identifier inside your Firebase project."
  },
  STEADFAST_API_KEY: {
    isUrgent: false,
    descEn: "Merchant API Key from Steadfast portal for automated parcel booking."
  },
  STEADFAST_SECRET_KEY: {
    isUrgent: false,
    descEn: "Merchant Secret Key from Steadfast portal for security validation."
  },
  REDX_API_TOKEN: {
    isUrgent: false,
    descEn: "API Bearer Token from RedX delivery service portal."
  },
  BKASH_APP_KEY: {
    isUrgent: false,
    descEn: "bKash Tokenizer Merchant Application Key for automated checkout."
  },
  BKASH_APP_SECRET: {
    isUrgent: false,
    descEn: "bKash Tokenizer Merchant Application Secret key."
  },
  SSLCOMMERZ_STORE_ID: {
    isUrgent: false,
    descEn: "SSLCommerz Merchant Store ID for local cards and multiple payment options."
  },
  SSLCOMMERZ_STORE_PASSWORD: {
    isUrgent: false,
    descEn: "SSLCommerz Merchant Store Password/Key."
  },
  GOOGLE_CLIENT_ID: {
    isUrgent: false,
    descEn: "Google OAuth Client ID for 1-click customer login."
  },
  GOOGLE_CLIENT_SECRET: {
    isUrgent: false,
    descEn: "Google OAuth Client Secret key."
  },
  SMS_API_KEY: {
    isUrgent: false,
    descEn: "API key or token from your local bulk SMS service provider."
  },
  SMS_SENDER_ID: {
    isUrgent: false,
    descEn: "Approved business masking sender ID (e.g. MAGMATI)."
  },
  EMAIL_API_KEY: {
    isUrgent: false,
    descEn: "API key from Resend or SendGrid for automated customer invoices."
  },
  EMAIL_FROM_ADDRESS: {
    isUrgent: false,
    descEn: "Sender email address shown on invoices (must be domain-verified).",
    defaultVal: "orders@magmati.com"
  },
  EMAIL_FROM_NAME: {
    isUrgent: false,
    descEn: "Sender display name shown in the customer inbox.",
    defaultVal: "MAGMATI Lifestyle"
  },
  ADMIN_NOTIFICATION_EMAIL: {
    isUrgent: false,
    descEn: "Email address where the admin receives instant new order alerts.",
    defaultVal: "admin@magmati.com"
  },
  STORE_NAME: {
    isUrgent: true,
    descEn: "Your store official brand name shown globally on the site.",
    defaultVal: "MAGMATI Lifestyle"
  },
  SUPPORT_PHONE: {
    isUrgent: true,
    descEn: "Store official phone number displayed for customer assistance.",
    defaultVal: "+880 1700-000000"
  },
  SUPPORT_EMAIL: {
    isUrgent: true,
    descEn: "Store official email displayed for customer support questions.",
    defaultVal: "support@magmati.com"
  }
};

export const EnvGroupFields: React.FC<EnvGroupFieldsProps> = ({
  groupId,
  store,
  showSecretMap,
  toggleShowSecret,
  handleCopyText,
  copiedKey,
}) => {
  const renderInput = (label: string, key: string, placeholder: string, isSecret = false) => {
    const meta = KEY_METADATA[key];
    const isUrgent = meta ? meta.isUrgent : false;
    const desc = meta ? meta.descEn : '';
    const defaultVal = meta?.defaultVal;

    return (
      <div key={key} className="space-y-1.5 p-3.5 bg-surface-subtle rounded-2xl border border-border-color/60 shadow-2xs transition-all hover:bg-white hover:border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <label className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">
              {label}
            </label>
            {isUrgent && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-2xs font-black leading-none">
                <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {store[key] && (
              <button
                type="button"
                onClick={() => handleCopyText(store[key], label)}
                className="text-2xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer font-bold font-sans"
              >
                {copiedKey === label ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-text-subtle" />}
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type={isSecret && !showSecretMap[key] ? 'password' : 'text'}
            value={store[key] || ''}
            onChange={(e) => store.updateEnvVar(key, e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 px-3.5 rounded-xl border border-border-color bg-white text-xs font-mono font-black text-text-main placeholder:text-zinc-300 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all pr-10 shadow-2xs"
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => toggleShowSecret(key)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-subtle hover:text-primary transition-colors cursor-pointer"
            >
              {showSecretMap[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {desc && (
          <p className="text-2xs text-text-muted font-medium leading-relaxed pl-1 flex items-start gap-1">
            <span className="text-primary mt-0.5 shrink-0">■</span>
            <span>{desc}</span>
          </p>
        )}

        {defaultVal && (
          <p className="text-2xs text-text-muted font-mono font-bold leading-normal pl-1.5 bg-surface-subtle/50 p-1 rounded-md border border-border-color/40">
            <span className="text-text-main select-all font-black">{defaultVal}</span>
          </p>
        )}
      </div>
    );
  };

  const renderToggle = (label: string, key: string, desc: string) => {
    const isChecked = store[key] === 'true' || store[key] === true;
    return (
      <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle border border-border-color/60 transition-all hover:bg-white hover:border-primary/20 shadow-2xs">
        <div>
          <span className="text-xs font-black text-text-main block">{label}</span>
          <span className="text-2xs text-text-muted font-medium">{desc}</span>
        </div>
        <button
          type="button"
          onClick={() => store.updateEnvVar(key, isChecked ? 'false' : 'true')}
          className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
            isChecked ? 'bg-primary' : 'bg-zinc-300'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
            isChecked ? 'left-6.5' : 'left-0.5'
          }`} />
        </button>
      </div>
    );
  };

  switch (groupId) {
    case 'cloudinary':
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Cloud Name', 'CLOUDINARY_CLOUD_NAME', 'e.g. magmati')}
            {renderInput('Upload Preset', 'CLOUDINARY_UPLOAD_PRESET', 'e.g. magmati_preset')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('API Key', 'CLOUDINARY_API_KEY', 'e.g. 123456789012345')}
            {renderInput('API Secret', 'CLOUDINARY_API_SECRET', 'Secret Key...', true)}
          </div>
        </div>
      );

    case 'gemini':
      return (
        <div className="space-y-3 animate-fade-in">
          {renderInput('Gemini API Key', 'GEMINI_API_KEY', 'AIzaSy...', true)}
          
          <div className="space-y-1">
            <label className="text-2xs font-black text-text-muted uppercase tracking-wider block px-1">
              Gemini Preferred Model
            </label>
            <select
              value={store.GEMINI_MODEL_NAME || 'gemini-2.5-flash'}
              onChange={(e) => store.updateEnvVar('GEMINI_MODEL_NAME', e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-xs font-bold text-text-main focus:outline-hidden focus:border-primary"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Recommended)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
            </select>
          </div>
        </div>
      );

    case 'firebase':
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Firebase API Key', 'FIREBASE_API_KEY', 'AIzaSy...', true)}
            {renderInput('Project ID', 'FIREBASE_PROJECT_ID', 'e.g. magmati-lifestyle')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Auth Domain', 'FIREBASE_AUTH_DOMAIN', 'magmati-lifestyle.firebaseapp.com')}
            {renderInput('Storage Bucket', 'FIREBASE_STORAGE_BUCKET', 'magmati-lifestyle.appspot.com')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Messaging Sender ID', 'FIREBASE_MESSAGING_SENDER_ID', '1234567890')}
            {renderInput('App ID', 'FIREBASE_APP_ID', '1:1234567890:web:abcdef')}
          </div>
        </div>
      );

    case 'courier':
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 bg-surface-subtle rounded-2xl border border-zinc-100 space-y-2">
            <span className="text-2xs font-black text-rose-600 uppercase block tracking-wider font-mono">Steadfast Courier</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInput('Steadfast API Key', 'STEADFAST_API_KEY', 'Api-Key...', true)}
              {renderInput('Steadfast Secret Key', 'STEADFAST_SECRET_KEY', 'Secret-Key...', true)}
            </div>
          </div>

          <div className="p-3 bg-surface-subtle rounded-2xl border border-zinc-100 space-y-2">
            <span className="text-2xs font-black text-orange-600 uppercase block tracking-wider font-mono">RedX Express Logistics</span>
            {renderInput('RedX API Bearer Token', 'REDX_API_TOKEN', 'Bearer Token...', true)}
          </div>
        </div>
      );

    case 'payment':
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="p-3 bg-surface-subtle rounded-2xl border border-zinc-100 space-y-2">
            <span className="text-2xs font-black text-pink-600 uppercase block tracking-wider font-mono">bKash Merchant Tokenizer</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInput('bKash App Key', 'BKASH_APP_KEY', 'App Key...', true)}
              {renderInput('bKash App Secret', 'BKASH_APP_SECRET', 'App Secret...', true)}
            </div>
          </div>

          <div className="p-3 bg-surface-subtle rounded-2xl border border-zinc-100 space-y-2">
            <span className="text-2xs font-black text-indigo-600 uppercase block tracking-wider font-mono">SSLCommerz Payment Gateway</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderInput('SSL Store ID', 'SSLCOMMERZ_STORE_ID', 'e.g. magmatilive', true)}
              {renderInput('SSL Store Password', 'SSLCOMMERZ_STORE_PASSWORD', 'Store Password...', true)}
            </div>
          </div>
        </div>
      );

    case 'auth':
      return (
        <div className="space-y-3 animate-fade-in">
          {renderInput('Google Client ID', 'GOOGLE_CLIENT_ID', '1234567890-xxx.apps.googleusercontent.com')}
          {renderInput('Google Client Secret', 'GOOGLE_CLIENT_SECRET', 'Secret Key...', true)}
        </div>
      );

    case 'sms':
      return (
        <div className="space-y-3 animate-fade-in">
          {renderToggle(
            'SMS Status',
            'SMS_ENABLED',
            'Toggle SMS notifications on order dispatch'
          )}

          <div className="space-y-1">
            <label className="text-2xs font-black text-text-muted uppercase tracking-wider block px-1">
              Preferred SMS Gateway Operator
            </label>
            <select
              value={store.SMS_PROVIDER || 'greenweb'}
              onChange={(e) => store.updateEnvVar('SMS_PROVIDER', e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-xs font-bold text-text-main focus:outline-hidden focus:border-primary"
            >
              <option value="greenweb">Greenweb SMS (BD)</option>
              <option value="bulksmsbd">BulkSMS BD</option>
              <option value="sslwireless">SSL Wireless</option>
              <option value="mimsms">MiMSMS</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('SMS API Token / Key', 'SMS_API_KEY', 'Secret API Token...', true)}
            {renderInput('Sender ID (Masking)', 'SMS_SENDER_ID', 'e.g. MAGMATI')}
          </div>

          <div className="space-y-2 pt-1">
            {renderToggle(
              'Order Placed SMS Trigger',
              'SMS_ON_ORDER_PLACED',
              'Dispatch instant SMS to customer right after order is created'
            )}
            {renderToggle(
              'Order Status Update Trigger',
              'SMS_ON_STATUS_CHANGE',
              'Dispatch instant SMS to customer when order goes from Pending to Shipped/Delivered'
            )}
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="space-y-3 animate-fade-in">
          {renderToggle(
            'Email Status',
            'EMAIL_ENABLED',
            'Toggle automated invoice email dispatch'
          )}

          <div className="space-y-1">
            <label className="text-2xs font-black text-text-muted uppercase tracking-wider block px-1">
              Preferred Email Dispatch Service
            </label>
            <select
              value={store.EMAIL_PROVIDER || 'resend'}
              onChange={(e) => store.updateEnvVar('EMAIL_PROVIDER', e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-xs font-bold text-text-main focus:outline-hidden focus:border-primary"
            >
              <option value="resend">Resend API (Recommended - Fast & Free)</option>
              <option value="sendgrid">SendGrid API</option>
              <option value="nodemailer">Custom SMTP (Gmail / Mailtrap)</option>
            </select>
          </div>

          {store.EMAIL_PROVIDER === 'nodemailer' ? (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('SMTP Host', 'SMTP_HOST', 'smtp.gmail.com')}
                {renderInput('SMTP Port', 'SMTP_PORT', '587 or 465')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('SMTP Username', 'SMTP_USER', 'user@domain.com')}
                {renderInput('SMTP App Password', 'SMTP_PASS', 'App Password...', true)}
              </div>
            </div>
          ) : (
            renderInput('Email API Key', 'EMAIL_API_KEY', 're_... or SG....', true)
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('From Email Address', 'EMAIL_FROM_ADDRESS', 'orders@magmati.com')}
            {renderInput('From Display Name', 'EMAIL_FROM_NAME', 'MAGMATI Lifestyle')}
          </div>

          {renderInput('Admin Notification Email', 'ADMIN_NOTIFICATION_EMAIL', 'admin@magmati.com')}
        </div>
      );

    case 'store':
      return (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Store Brand Name', 'STORE_NAME', 'MAGMATI Lifestyle')}
            {renderInput('Official Support Phone', 'SUPPORT_PHONE', '+880 1700-000000')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderInput('Support Email', 'SUPPORT_EMAIL', 'support@magmati.com')}
          </div>
        </div>
      );

    default:
      return null;
  }
};
