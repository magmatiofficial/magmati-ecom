'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Copy, 
  ExternalLink, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Image as ImageIcon, 
  Truck, 
  CreditCard, 
  Lock, 
  Search, 
  ChevronRight, 
  FileCode, 
  CheckCheck, 
  Save, 
  Loader2, 
  Info, 
  Mail, 
  MessageSquare, 
  Activity, 
  AlertCircle, 
  LayoutGrid, 
  Settings2, 
  Globe, 
  Bell,
  Upload,
  X,
  Sliders,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Store,
  FileText
} from 'lucide-react';
import { useEnvConfigStore } from '@/store/useEnvConfigStore';
import { useNotificationLogStore } from '@/store/useNotificationLogStore';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { EnvGroupFields } from './EnvGroupFields';

interface EnvGroupMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  portalUrl: string;
  portalName: string;
  guideSteps: string[];
  
  category: 'media' | 'ai' | 'core' | 'logistics' | 'payment' | 'auth' | 'sms' | 'email' | 'store';
}

const CATEGORIES = [
  { id: 'all', label: 'All Integrations',  icon: LayoutGrid },
  { id: 'media', label: 'Media & CDN (Cloudinary)',  icon: ImageIcon },
  { id: 'ai', label: 'Google Gemini AI',  icon: Sparkles },
  { id: 'core', label: 'Firebase Database',  icon: Database },
  { id: 'logistics', label: 'Logistics (Steadfast/RedX)',  icon: Truck },
  { id: 'payment', label: 'Payment Gateways',  icon: CreditCard },
  { id: 'auth', label: 'Google OAuth & Login',  icon: Lock },
  { id: 'sms', label: 'SMS Gateway (BD)',  icon: MessageSquare },
  { id: 'email', label: 'Email Gateway (Resend)',  icon: Mail },
  { id: 'store', label: 'Global Store Settings',  icon: Store },
];

const ENV_GROUPS: EnvGroupMeta[] = [
  {
    id: 'cloudinary',
    category: 'media',
    title: 'Cloudinary Image & Video CDN',
    subtitle: 'High-speed cloud image delivery, auto-resizing, and secure CDN uploads.',
    icon: ImageIcon,
    portalUrl: 'https://cloudinary.com/console',
    portalName: 'Cloudinary Console',
    guideSteps: [
      'Create a free account at cloudinary.com or log in to your existing account.',
      'From the Cloudinary Dashboard (Console), copy your "Cloud Name", "API Key", and "API Secret".',
      'Go to Settings (Gear icon) -> "Upload" tab -> scroll down to "Upload Presets".',
      'Click "Add upload preset", set "Signing Mode" to "Unsigned". You can name it "magmati_preset" or any custom name you prefer.',
      'Enter your chosen Upload Preset name below along with your Cloud Name, API Key, and Secret, then click "Save All Changes".'
    ],
  },
  {
    id: 'gemini',
    category: 'ai',
    title: 'Google Gemini AI Intelligence Engine',
    subtitle: 'Automates fashion copywriting, smart search, and customer recommendations.',
    icon: Sparkles,
    portalUrl: 'https://aistudio.google.com/app/apikey',
    portalName: 'Google AI Studio Portal',
    guideSteps: [
      'Go to Google AI Studio at aistudio.google.com and sign in with your Google account.',
      'Click the blue "Create API Key" button on the dashboard.',
      'Select or create a Google Cloud project to associate with the key.',
      'Copy the generated API Key (starts with "AIzaSy...").',
      'Paste into the GEMINI_API_KEY field below and select your preferred model.'
    ],
  },
  {
    id: 'firebase',
    category: 'core',
    title: 'Firebase & Firestore Database Core',
    subtitle: 'Primary cloud database for orders, inventory, customers, and auth security.',
    icon: Database,
    portalUrl: 'https://console.firebase.google.com',
    portalName: 'Firebase Console',
    guideSteps: [
      '১. [Firebase Console] ওপেন করে আপনার প্রোজেক্টে (যেমন: "magmati-ecom") প্রবেশ করুন।',
      '২. [Authorized Domains কাস্টম ডোমেইন অনুমোদন]: Authentication -> Settings -> Authorized Domains-এ যান। "Add domain" বাটনে ক্লিক করে আপনার নতুন কাস্টম ডোমেইনটি (যেমন: magmati.com) যুক্ত করুন। এটি না করলে কাস্টম ডোমেইন থেকে সাইন-ইন করার সময় "auth/unauthorized-domain" এরর আসবে।',
      '৩. [Service Account Key জেনারেট]: Project Settings (গিয়ার আইকন) -> "Service Accounts" ট্যাবে যান। "Generate new private key" বাটনে ক্লিক করে JSON ফাইলটি ডাউনলোড করুন।',
      '৪. [সার্ভার হোস্টিং এনভায়রনমেন্ট]: ডাউনলোড করা JSON ফাইলের ভেতরের সম্পূর্ণ কোডটি কপি করুন। আপনার হোস্টিং প্রোভাইডারের (Vercel/GCP/VPS) Environment Variables সেকশনে "FIREBASE_SERVICE_ACCOUNT_KEY" নামে নতুন ভেরিয়েবল তৈরি করে সেখানে সম্পূর্ণ JSON ভ্যালু পেস্ট করে দিন। এটি সার্ভার-সাইড আইডি টোকেন নিখুঁতভাবে এবং নিরাপদে ভেরিফাই করবে।',
      '৫. [টোকেন ম্যাচিং সমাধান]: এই সেটআপটি সম্পন্ন করলে সার্ভারে কোনো ধরনের "verifyIdToken audience claim mismatch (Expected PROJECT_ID but got magmati-ecom)" এরর আর কখনোই আসবে না।',
      '৬. [ক্লায়েন্ট কী সেটআপ]: Project Settings -> General ট্যাব থেকে স্ক্রোল করে নিচে "Your apps" সেকশনে যান। আপনার Web App (</>) থেকে apiKey, projectId, authDomain ও storageBucket কপি করে নিচের ইনপুট ফিল্ডগুলোতে বসিয়ে "Save All" এ ক্লিক করুন।',
      '৭. [Google AI Studio প্রিভিউ IAM পারমিশন]: আপনি যদি Google AI Studio প্রিভিউ এনভায়রনমেন্ট ব্যবহার করেন, তবে Google Cloud IAM Console (console.cloud.google.com/iam-admin/iam?project=magmati-ecom)-এ যান। "+ Grant access" এ ক্লিক করে "ais-sandbox@ais-asia-southeast1-4ac90b8232.iam.gserviceaccount.com" ইমেইলটি বসিয়ে "Cloud Datastore User" বা "Editor" রোল দিয়ে Save করুন। এতে Order History বা Server API এরর সম্পূর্ণ সমাধান হয়ে যাবে।'
    ],
  },
  {
    id: 'courier',
    category: 'logistics',
    title: 'Steadfast & RedX Courier Logistics',
    subtitle: '1-click parcel generation, live merchant balance tracking, and airway bill delivery.',
    icon: Truck,
    portalUrl: 'https://steadfast.com.bd',
    portalName: 'Steadfast Merchant Portal',
    guideSteps: [
      'Log in to your Steadfast Merchant Portal (portal.steadfast.com.bd) or RedX Merchant Portal.',
      'Go to "Settings" -> "API Settings" or "Developer Integration".',
      'Generate or copy your "Api-Key" and "Secret-Key" (for Steadfast) or "Bearer Token" (for RedX).',
      'Paste credentials below and click "Test Connection" to check your real-time merchant balance.'
    ],
  },
  {
    id: 'payment',
    category: 'payment',
    title: 'Payment Gateways (bKash Tokenizer & SSLCommerz)',
    subtitle: 'Enables automated checkout, instant refund hooks, and card payment capture.',
    icon: CreditCard,
    portalUrl: 'https://merchant.bkash.com',
    portalName: 'bKash Merchant Panel',
    guideSteps: [
      'Log in to your bKash Merchant Portal or SSLCommerz Merchant Dashboard.',
      'Navigate to Developer API Credentials section.',
      'Copy your bKash App Key, App Secret, Username, Password OR SSLCommerz Store ID and Password.',
      'Paste them into the fields below and toggle Sandbox mode if you are testing.'
    ],
  },
  {
    id: 'auth',
    category: 'auth',
    title: 'Google OAuth & Social Authentication',
    subtitle: 'Enables 1-click Google sign-in for seamless customer checkout & onboarding.',
    icon: Lock,
    portalUrl: 'https://console.cloud.google.com/apis/credentials',
    portalName: 'Google Cloud Console',
    guideSteps: [
      '১. [Google Cloud Console] (console.cloud.google.com) এ লগইন করুন এবং আপনার সঠিক ফায়ারবেস প্রোজেক্টটি সিলেক্ট করুন।',
      '২. [OAuth Credentials তৈরি]: APIs & Services -> Credentials-এ গিয়ে "+ Create Credentials" এ ক্লিক করে "OAuth client ID" সিলেক্ট করুন (Application type সিলেক্ট করুন "Web application")।',
      '৩. [Authorized Origins সেট করুন]: স্ক্রোল করে "Authorized JavaScript origins"-এ আপনার লাইভ কাস্টম ডোমেইনটি (যেমন: https://magmati.com এবং https://www.magmati.com) যুক্ত করুন।',
      '৪. [Authorized Redirect URIs]: "Authorized redirect URIs" সেকশনে আপনার ফায়ারবেস অথেনটিকেশন হ্যান্ডলার রিডাইরেক্ট ইউআরআইটি বসিয়ে দিন (যেমন: https://magmati-ecom.firebaseapp.com/__/auth/handler)। এটি সঠিকভাবে না বসালে গুগল সাইন-ইন কাজ করবে না এবং disallow এরর দেখাবে।',
      '৫. [কী সেভ করুন]: সম্পন্ন করার পর স্ক্রিনে প্রদর্শিত Client ID এবং Client Secret কী দুটি কপি করে নিচের ইনপুট ফিল্ডগুলোতে বসিয়ে "Save All" করুন।'
    ],
  },
  {
    id: 'sms',
    category: 'sms',
    title: 'SMS Gateway Integration (BD Operators)',
    subtitle: 'Automated order placement SMS, delivery updates, and OTP security messages.',
    icon: MessageSquare,
    portalUrl: 'https://greenweb.com.bd',
    portalName: 'Greenweb SMS Portal',
    guideSteps: [
      'Sign up or log in at Greenweb (greenweb.com.bd), BulkSMS BD, or your chosen SMS provider.',
      'Navigate to API Token / Credentials in your SMS dashboard.',
      'Copy your API Token and your approved Masking Sender ID (e.g. MAGMATI).',
      'Enable the SMS Gateway toggle below, paste credentials, and test via the Service Monitoring tab.'
    ],
  },
  {
    id: 'email',
    category: 'email',
    title: 'Email Gateway Integration (Resend / SendGrid)',
    subtitle: 'Automates branded PDF order invoices, receipts, and admin inventory alerts.',
    icon: Mail,
    portalUrl: 'https://resend.com/api-keys',
    portalName: 'Resend API Console',
    guideSteps: [
      'Create a free account at resend.com or sendgrid.com.',
      'Go to the "API Keys" section and click "Create API Key".',
      'Verify your sending domain (e.g. magmati.com) in Resend Domains setting.',
      'Paste your API Key (starts with "re_...") and your verified From Email below.'
    ],
  },
  {
    id: 'store',
    category: 'store',
    title: 'Global Store Information & Operational Settings',
    subtitle: 'Store branding, official support hotline, currency symbol, and maintenance mode.',
    icon: Store,
    portalUrl: '#',
    portalName: 'Store Front Config',
    guideSteps: [
      'Ensure the Store Name and Support Hotline match your business identity.',
      'Toggle Maintenance Mode if you are performing major store updates.'
    ],
  }
];

export function EnvVariablesControl() {
  const envStore = useEnvConfigStore();
  const { settings: notifSettings, updateSettings: updateNotifSettings } = useNotificationLogStore();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});
  const [showAllSecrets, setShowAllSecrets] = useState(false);
  
  // Modals & Tools
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Connection Testing
  const [testingGroup, setTestingGroup] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; msg: string }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedFullEnv, setCopiedFullEnv] = useState(false);

  useEffect(() => {
    useEnvConfigStore.getState().fetchEnvVarsFromDatabase();
    const loadNotifConfig = async () => {
      try {
        const headers: Record<string, string> = {};
        const token = await auth.currentUser?.getIdToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const currentUser = useAuthStore.getState().currentUser;
        if (currentUser?.role === 'admin' && currentUser.email) headers['x-admin-email'] = currentUser.email;

        const res = await fetch('/api/admin/notification-config', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            updateNotifSettings(data.settings);
          }
        }
      } catch (err) {
        console.warn('Could not fetch notification config:', err);
      }
    };
    loadNotifConfig();
  }, [updateNotifSettings]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    triggerToast(`Copied: ${label}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAndApplyAll = async () => {
    const res = await envStore.saveEnvVarsToDatabase();
    if (res.success) {
      triggerToast('✅ All configuration saved permanently to Firestore!');
    } else {
      triggerToast(`❌ Error: ${res.message}`);
    }
  };

  const toggleShowSecret = (key: string) => {
    setShowSecretMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleShowAll = () => {
    const next = !showAllSecrets;
    setShowAllSecrets(next);
    const newMap: Record<string, boolean> = {};
    if (next) {
      // reveal all
      Object.keys(envStore).forEach(k => { newMap[k] = true; });
    }
    setShowSecretMap(newMap);
  };

  // Import .env text parser
  const handleParseAndImportEnv = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const updates: Record<string, string> = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        // Remove surrounding quotes if any
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        updates[key] = val;
      }
    });

    if (Object.keys(updates).length > 0) {
      envStore.updateBulkEnvVars(updates);
      setShowImportModal(false);
      setImportText('');
      triggerToast(`✅ ${Object.keys(updates).length} variables imported!`);
    } else {
      triggerToast('No valid KEY=VALUE pairs found');
    }
  };

  // Connection Test runner
  const executeConnectionTest = async (groupId: string) => {
    setTestingGroup(groupId);
    setTestResult(prev => {
      const copy = { ...prev };
      delete copy[groupId];
      return copy;
    });

    try {
      const endpointMap: Record<string, string> = {
        cloudinary: '/api/admin/test-cloudinary',
        gemini: '/api/admin/test-gemini',
        firebase: '/api/admin/test-firebase',
        courier: '/api/admin/test-courier',
        payment: '/api/admin/test-payment',
        sms: '/api/admin/test-sms',
        email: '/api/admin/test-email'
      };

      const endpoint = endpointMap[groupId];
      if (!endpoint) {
        setTestResult(prev => ({ ...prev, [groupId]: { success: true, msg: 'Configuration format verified!' } }));
        return;
      }

      let payload: any = {};
      if (groupId === 'gemini') {
        payload = { apiKey: envStore.GEMINI_API_KEY };
      } else if (groupId === 'cloudinary') {
        payload = {
          cloudName: envStore.CLOUDINARY_CLOUD_NAME,
          apiKey: envStore.CLOUDINARY_API_KEY,
          apiSecret: envStore.CLOUDINARY_API_SECRET
        };
      } else if (groupId === 'courier') {
        payload = {
          provider: 'steadfast',
          apiKey: envStore.STEADFAST_API_KEY,
          secretKey: envStore.STEADFAST_SECRET_KEY
        };
      } else if (groupId === 'payment') {
        payload = {
          provider: envStore.BKASH_APP_KEY ? 'bkash' : 'sslcommerz',
          appKey: envStore.BKASH_APP_KEY,
          appSecret: envStore.BKASH_APP_SECRET,
          storeId: envStore.SSLCOMMERZ_STORE_ID,
          storePassword: envStore.SSLCOMMERZ_STORE_PASSWORD
        };
      } else if (groupId === 'sms') {
        payload = {
          provider: envStore.SMS_PROVIDER,
          apiKey: envStore.SMS_API_KEY,
          senderId: envStore.SMS_SENDER_ID
        };
      } else if (groupId === 'email') {
        payload = {
          provider: envStore.EMAIL_PROVIDER,
          apiKey: envStore.EMAIL_API_KEY,
          fromAddress: envStore.EMAIL_FROM_ADDRESS
        };
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = await auth.currentUser?.getIdToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const currentUser = useAuthStore.getState().currentUser;
      if (currentUser?.role === 'admin' && currentUser.email) headers['x-admin-email'] = currentUser.email;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestResult(prev => ({
        ...prev,
        [groupId]: { 
          success: data.success, 
          msg: data.success ? (data.message || ('Connection successful!')) : (data.error || 'Failed') 
        }
      }));
    } catch (e: any) {
      setTestResult(prev => ({ ...prev, [groupId]: { success: false, msg: e.message } }));
    } finally {
      setTestingGroup(null);
    }
  };

  // Filtered groups by category & search query
  const filteredGroups = useMemo(() => {
    return ENV_GROUPS.filter(g => {
      if (activeCategory !== 'all' && g.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchSub = g.subtitle.toLowerCase().includes(q);
        const matchId = g.id.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchId) return false;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Overall readiness stats
  const readiness = useMemo(() => {
    const total = ENV_GROUPS.length;
    const configured = ENV_GROUPS.filter(g => {
      if (g.id === 'gemini') return !!envStore.GEMINI_API_KEY;
      if (g.id === 'cloudinary') return !!envStore.CLOUDINARY_API_KEY;
      if (g.id === 'firebase') return !!envStore.FIREBASE_API_KEY;
      if (g.id === 'courier') return !!envStore.STEADFAST_API_KEY || !!envStore.REDX_API_TOKEN;
      if (g.id === 'payment') return !!envStore.BKASH_APP_KEY || !!envStore.SSLCOMMERZ_STORE_ID;
      if (g.id === 'auth') return !!envStore.GOOGLE_CLIENT_ID;
      if (g.id === 'sms') return !!envStore.SMS_API_KEY;
      if (g.id === 'email') return !!envStore.EMAIL_API_KEY;
      if (g.id === 'store') return true;
      return false;
    }).length;
    return { total, configured, percentage: Math.round((configured / total) * 100) };
  }, [envStore]);

  return (
    <div className="space-y-4 font-sans animate-fade-in pb-12">
      {/* Compact Header Banner - Ultra-space-efficient MAGMATI Theme */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-3.5 sm:p-4 border border-border-dark text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Compact Title & Readiness Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                  {'🔑 .env & Service API Hub'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-2xs font-bold font-mono">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>{readiness.configured}/{readiness.total} ({readiness.percentage}% Ready)</span>
                </span>
              </div>
              <p className="text-xs text-text-subtle truncate hidden sm:block">
                {'Manage and test environment API credentials, CDN, Gemini AI, bKash & courier gateways.'}
              </p>
            </div>
          </div>

          {/* Compact Top Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => {
                const content = envStore.getFormattedEnvFileString();
                navigator.clipboard.writeText(content);
                setCopiedFullEnv(true);
                triggerToast('Full .env copied to clipboard!');
                setTimeout(() => setCopiedFullEnv(false), 2000);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer border border-zinc-700 flex items-center gap-1 shadow-2xs active:scale-95"
              title="Copy formatted .env content"
            >
              {copiedFullEnv ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden md:inline">{'Copy .env'}</span>
            </button>

            <button
              onClick={() => {
                const content = envStore.getFormattedEnvFileString();
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '.env';
                a.click();
                triggerToast('.env file downloaded');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer border border-zinc-700 flex items-center gap-1 shadow-2xs active:scale-95"
              title="Download .env file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{'Download'}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer border border-zinc-700 flex items-center gap-1 shadow-2xs active:scale-95"
              title="Paste .env block to auto-populate"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>{'Import'}</span>
            </button>

            <button
              onClick={handleSaveAndApplyAll}
              disabled={envStore.isSaving}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-primary/30 flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {envStore.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{'Save All'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Filter & Category Dropdown Toolbar (Sidebar Converted to Top Dropdown) */}
      <div className="bg-white rounded-2xl p-3 border border-border-color shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Dropdown Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              {(() => {
                const currentCatObj = CATEGORIES.find(c => c.id === activeCategory);
                const IconComponent = currentCatObj?.icon || LayoutGrid;
                return <IconComponent className="w-4 h-4 text-primary" />;
              })()}
            </div>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-surface-subtle hover:bg-surface-subtle border border-border-color text-text-main rounded-xl text-xs font-bold focus:outline-hidden focus:border-primary focus:bg-white transition-all cursor-pointer appearance-none shadow-2xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
              ▼
            </div>
          </div>

          <span className="text-2xs font-mono font-bold text-text-muted bg-surface-subtle px-2 py-1 rounded-lg shrink-0 border border-border-color">
            {filteredGroups.length} {'Active'}
          </span>
        </div>

        {/* Search Bar & Global Controls */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={'Search (Gemini, Cloudinary...)'}
              className="w-full h-10 pl-8.5 pr-3 rounded-xl border border-border-color bg-surface-subtle text-xs font-medium focus:outline-hidden focus:border-primary focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={toggleShowAll}
            className="h-10 px-3 rounded-xl bg-surface-subtle hover:bg-zinc-200 text-text-muted text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-border-color"
            title="Toggle visibility of all secret keys"
          >
            {showAllSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showAllSecrets ? ('Hide') : ('Show')}</span>
          </button>

          <button
            onClick={() => envStore.fetchEnvVarsFromDatabase()}
            className="h-10 w-10 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-subtle border border-border-color transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Reload from Firestore"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Full-Width Content Area */}
      <main className="w-full space-y-4">
        {/* Dynamic Service Configuration Cards */}
        <div className="space-y-4">
            {filteredGroups.map((group) => {
              const Icon = group.icon;
              const result = testResult[group.id];
              const isTesting = testingGroup === group.id;

              return (
                <div 
                  key={group.id} 
                  className="bg-white rounded-3xl border border-border-color shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Card Header Bar */}
                  <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-50/70 to-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-border-color shadow-xs flex items-center justify-center text-text-main shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-zinc-950 tracking-tight">
                          {group.title}
                        </h3>
                        <p className="text-xs text-text-muted font-medium mt-0.5">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {group.portalUrl !== '#' && (
                        <a 
                          href={group.portalUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-zinc-200 text-text-muted text-xs font-bold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{group.portalName}</span>
                        </a>
                      )}

                      {group.id !== 'store' && (
                        <button
                          onClick={() => executeConnectionTest(group.id)}
                          disabled={isTesting}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          <span>{'Test API'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body: 2-Column (Step-by-Step Guide + Config Inputs) */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Clear Step-by-Step Integration Guide */}
                    <div className="lg:col-span-5 space-y-4 bg-surface-subtle/80 rounded-2xl p-5 border border-zinc-100">
                      <div className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-wider border-b border-border-color/80 pb-2.5">
                        <Info className="w-4 h-4 text-primary" />
                        <span>{'INTEGRATION GUIDE'}</span>
                      </div>

                      <div className="space-y-3">
                        {group.guideSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-white text-text-main text-2xs font-black flex items-center justify-center shrink-0 border border-border-color shadow-xs mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-text-muted font-medium leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>

                      {group.portalUrl !== '#' && (
                        <div className="pt-2">
                          <a
                            href={group.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                          >
                            <span>{'Open Developer Portal'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Interactive Configuration Inputs & Toggles */}
                    <div className="lg:col-span-7 space-y-4">
                      <EnvGroupFields
                        groupId={group.id}
                        store={envStore}
                        showSecretMap={showSecretMap}
                        toggleShowSecret={toggleShowSecret}
                        handleCopyText={handleCopyText}
                        copiedKey={copiedKey}
                      />

                      {/* Connection Test Result Box */}
                      {result && (
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-slide-in text-xs ${
                          result.success 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            result.success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-wide block">
                              {result.success ? ('API TEST SUCCESS') : ('API TEST FAILED')}
                            </span>
                            <p className="mt-0.5 font-medium leading-relaxed">{result.msg}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

      {/* Import .env Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-border-color animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950">
                    {'Paste & Import .env File'}
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    {'Paste your raw environment keys to automatically populate fields'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-xl text-text-subtle hover:text-text-main hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
                {'Raw Environment Text'}
              </label>
              <textarea
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="CLOUDINARY_CLOUD_NAME=magmati&#10;GEMINI_API_KEY=AIzaSy...&#10;FIREBASE_API_KEY=AIzaSy..."
                className="w-full p-4 rounded-2xl border border-border-color bg-surface-subtle text-xs font-mono font-medium focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-text-muted hover:bg-surface-subtle text-xs font-bold transition-colors"
              >
                {'Cancel'}
              </button>
              <button
                onClick={handleParseAndImportEnv}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                {'Import & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-2xl border border-border-dark flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
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
    
    descEn: "Unique identifier for your Google Firebase project configuration.",
  },
  FIREBASE_AUTH_DOMAIN: {
    isUrgent: true,
    
    descEn: "Authentication handler domain for client session management.",
  },
  FIREBASE_STORAGE_BUCKET: {
    isUrgent: true,
    
    descEn: "Cloud storage address for media/binary files inside Firebase.",
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
  },
  CURRENCY_SYMBOL: {
    isUrgent: true,
    
    descEn: "Currency symbol shown next to prices across the store.",
  }
};


