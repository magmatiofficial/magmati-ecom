'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Database,
  Mail,
  MessageSquare,
  Sparkles,
  Trash2,
  ImageIcon,
  Truck,
  CreditCard,
  Server,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  XCircle,
  MoreVertical,
  Filter,
  RefreshCw,
  Search,
  Download,
  Send,
  Loader2,
  Check,
  X,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Play,
  RotateCcw,
  Info
} from 'lucide-react';
import { useNotificationLogStore, NotificationLogEntry } from '@/store/useNotificationLogStore';
import { useEnvConfigStore } from '@/store/useEnvConfigStore';
import { useOrderStore } from '@/store/useOrderStore';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';
import { NotificationSandbox } from './NotificationSandbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function NotificationsTab() {
  const { logs, clearLogs, addLog } = useNotificationLogStore();
  const envConfig = useEnvConfigStore();
  const { orders } = useOrderStore();

  // Active sub tab and search/filter state
  const [activeChannelFilter, setActiveChannelFilter] = useState<'all' | 'sms' | 'email' | 'courier' | 'system'>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'sent' | 'failed' | 'skipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Diagnostics & Ping state
  const [isDiagnosingAll, setIsDiagnosingAll] = useState(false);
  const [serviceLatencies, setServiceLatencies] = useState<Record<string, { status: string; latencyMs: number; message: string }>>({});
  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(null);

  // Selected Log for Inspection Modal
  const [selectedLog, setSelectedLog] = useState<NotificationLogEntry | null>(null);

  // Manual Test Sandboxes state
  const [activeSandbox, setActiveSandbox] = useState<'sms' | 'email' | 'gemini' | 'courier' | 'cloudinary' | null>(null);
  


  // Single service quick ping state
  const [pingingServiceId, setPingingServiceId] = useState<string | null>(null);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Run initial diagnostic check on load if not done
  const runFullDiagnostics = async () => {
    setIsDiagnosingAll(true);
    try {
      const res = await fetch('/api/admin/ping-all', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.services) {
        const latencyMap: Record<string, { status: string; latencyMs: number; message: string }> = {};
        data.services.forEach((s: any) => {
          latencyMap[s.id] = {
            status: s.status,
            latencyMs: s.latencyMs,
            message: s.message
          };
        });
        setServiceLatencies(latencyMap);
        setLastCheckedTime(new Date().toLocaleTimeString());
        triggerToast('✅ Diagnostics completed successfully!');
      }
    } catch (e: any) {
      triggerToast('Diagnostic check failed');
    } finally {
      setIsDiagnosingAll(false);
    }
  };

  const pingSingleService = async (serviceId: string) => {
    setPingingServiceId(serviceId);
    const t0 = Date.now();
    try {
      let endpoint = '/api/admin/ping-all';
      let payload: any = {};

      if (serviceId === 'gemini') {
        endpoint = '/api/admin/test-gemini';
        payload = { apiKey: envConfig.GEMINI_API_KEY };
      } else if (serviceId === 'cloudinary') {
        endpoint = '/api/admin/test-cloudinary';
        payload = {
          cloudName: envConfig.CLOUDINARY_CLOUD_NAME,
          apiKey: envConfig.CLOUDINARY_API_KEY,
          apiSecret: envConfig.CLOUDINARY_API_SECRET
        };
      } else if (serviceId === 'firebase') {
        endpoint = '/api/admin/test-firebase';
      } else if (serviceId === 'courier' || serviceId === 'steadfast') {
        endpoint = '/api/admin/test-courier';
        payload = {
          provider: 'steadfast',
          apiKey: envConfig.STEADFAST_API_KEY,
          secretKey: envConfig.STEADFAST_SECRET_KEY
        };
      } else if (serviceId === 'sms') {
        endpoint = '/api/admin/test-sms';
        payload = {
          provider: envConfig.SMS_PROVIDER || 'greenweb',
          apiKey: envConfig.SMS_API_KEY,
          senderId: envConfig.SMS_SENDER_ID
        };
      } else if (serviceId === 'email') {
        endpoint = '/api/admin/test-email';
        payload = {
          provider: envConfig.EMAIL_PROVIDER || 'resend',
          apiKey: envConfig.EMAIL_API_KEY,
          fromAddress: envConfig.EMAIL_FROM_ADDRESS
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const latency = Date.now() - t0;

      setServiceLatencies(prev => ({
        ...prev,
        [serviceId]: {
          status: data.success ? 'online' : 'degraded',
          latencyMs: latency,
          message: data.message || data.text || data.error || (data.success ? 'Online' : 'Failed')
        }
      }));

      triggerToast(
        data.success 
          ? (`✅ ${serviceId.toUpperCase()} online (${latency}ms)`)
          : `❌ ${data.error || 'Check failed'}`
      );
    } catch (e: any) {
      setServiceLatencies(prev => ({
        ...prev,
        [serviceId]: {
          status: 'degraded',
          latencyMs: Date.now() - t0,
          message: e.message
        }
      }));
    } finally {
      setPingingServiceId(null);
    }
  };



  // Live real-time stats
  const stats = useMemo(() => {
    const totalSmsSent = logs.filter(l => l.channel === 'sms' && l.status === 'sent').length;
    const totalSmsFailed = logs.filter(l => l.channel === 'sms' && l.status === 'failed').length;

    const totalEmailSent = logs.filter(l => l.channel === 'email' && l.status === 'sent').length;
    const totalEmailFailed = logs.filter(l => l.channel === 'email' && l.status === 'failed').length;

    const bkashOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('bkash')).length;
    const sslOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('ssl') || o.paymentMethod?.toLowerCase().includes('card')).length;

    const steadfastBooked = orders.filter(o => o.courier?.toLowerCase().includes('steadfast') || o.courierBooked === 'steadfast').length;
    const redxBooked = orders.filter(o => o.courier?.toLowerCase().includes('redx') || o.courierBooked === 'redx').length;

    const activeList = [
      !!envConfig.FIREBASE_API_KEY,
      !!envConfig.GEMINI_API_KEY,
      !!envConfig.CLOUDINARY_API_KEY,
      envConfig.SMS_ENABLED === 'true',
      envConfig.EMAIL_ENABLED === 'true',
      !!envConfig.STEADFAST_API_KEY,
      !!envConfig.REDX_API_TOKEN,
      !!envConfig.BKASH_APP_KEY || !!envConfig.SSLCOMMERZ_STORE_ID
    ];

    const activeCount = activeList.filter(Boolean).length;
    const healthPercent = Math.round((activeCount / 8) * 100);

    return {
      totalSmsSent,
      totalSmsFailed,
      totalEmailSent,
      totalEmailFailed,
      bkashOrders,
      sslOrders,
      steadfastBooked,
      redxBooked,
      activeCount,
      healthPercent,
      uptime: '99.98%'
    };
  }, [logs, orders, envConfig]);

  // Service definitions
  const services = [
    { 
      id: 'firebase', 
      titleEn: 'Firebase Firestore', 
      descEn: 'Persistent cloud database & customer security perimeter',
      
      icon: Database, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      isConfigured: !!envConfig.FIREBASE_API_KEY 
    },
    { 
      id: 'gemini', 
      titleEn: 'Google Gemini AI', 
      descEn: 'Smart fashion descriptions, recommendations & auto-tagging',
      
      icon: Sparkles, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50', 
      border: 'border-purple-200',
      isConfigured: !!envConfig.GEMINI_API_KEY 
    },
    { 
      id: 'cloudinary', 
      titleEn: 'Cloudinary CDN', 
      descEn: 'High-speed image & video delivery with on-the-fly optimization',
      
      icon: ImageIcon, 
      color: 'text-sky-500', 
      bg: 'bg-sky-50', 
      border: 'border-sky-200',
      isConfigured: !!envConfig.CLOUDINARY_API_KEY 
    },
    { 
      id: 'sms', 
      titleEn: 'SMS Gateway (BD)', 
      descEn: 'Instant order confirmation SMS & OTP verification dispatch',
      
      icon: MessageSquare, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      isConfigured: envConfig.SMS_ENABLED === 'true' && !!envConfig.SMS_API_KEY 
    },
    { 
      id: 'email', 
      titleEn: 'Email Gateway (Resend)', 
      descEn: 'Digital PDF invoices, receipts & admin order alerts',
      
      icon: Mail, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50', 
      border: 'border-indigo-200',
      isConfigured: envConfig.EMAIL_ENABLED === 'true' 
    },
    { 
      id: 'steadfast', 
      titleEn: 'Steadfast Courier', 
      descEn: '1-click parcel generation, automated airway bill & tracking',
      icon: Truck, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50', 
      border: 'border-rose-200',
      isConfigured: !!envConfig.STEADFAST_API_KEY 
    },
    { 
      id: 'redx', 
      titleEn: 'RedX Logistics', 
      descEn: 'Nationwide B2B express parcel pickup & door-to-door delivery',
      
      icon: Truck, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200',
      isConfigured: !!envConfig.REDX_API_TOKEN 
    },
    { 
      id: 'payment', 
      titleEn: 'bKash & SSLCommerz', 
      descEn: 'Secure digital checkout, IPN webhook & automated tokenization',
      
      icon: CreditCard, 
      color: 'text-pink-500', 
      bg: 'bg-pink-50', 
      border: 'border-pink-200',
      isConfigured: !!envConfig.BKASH_APP_KEY || !!envConfig.SSLCOMMERZ_STORE_ID 
    }
  ];

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Channel filter
      if (activeChannelFilter === 'sms' && log.channel !== 'sms') return false;
      if (activeChannelFilter === 'email' && log.channel !== 'email') return false;
      if (activeChannelFilter === 'system' && log.recipient !== 'System Initialized') return false;

      // Status filter
      if (activeStatusFilter !== 'all' && log.status !== activeStatusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRecip = log.recipient?.toLowerCase().includes(q);
        const matchSum = log.summary?.toLowerCase().includes(q);
        const matchDet = log.details?.toLowerCase().includes(q);
        const matchProv = log.provider?.toLowerCase().includes(q);
        if (!matchRecip && !matchSum && !matchDet && !matchProv) return false;
      }

      return true;
    });
  }, [logs, activeChannelFilter, activeStatusFilter, searchQuery]);

  // Export logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      triggerToast('No logs to export');
      return;
    }
    const headers = ['Timestamp', 'Channel', 'Event', 'Recipient', 'Status', 'Provider', 'Summary', 'Details'];
    const rows = logs.map(l => [
      l.timestamp,
      l.channel,
      l.eventType,
      `"${l.recipient.replace(/"/g, '""')}"`,
      l.status,
      `"${(l.provider || '').replace(/"/g, '""')}"`,
      `"${(l.summary || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magmati_activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    triggerToast('Logs exported to CSV');
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in pb-12">
      {/* Top Hero Card with MAGMATI Theme - Compact & Sleek */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-4 sm:p-5 border border-border-dark text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-2xs font-black uppercase tracking-wider">
                <Zap className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>{'SYSTEM HEALTH: '}{stats.healthPercent}%</span>
              </span>
              {lastCheckedTime && (
                <span className="text-2xs text-text-subtle font-mono">
                  {'Last Ping: '}{lastCheckedTime}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>📊</span>
              <span>{'Service & Gateway Activity HQ'}</span>
            </h2>
            <p className="text-xs text-text-subtle max-w-xl leading-snug">
              {'Monitor real-time connection status, response latency, and dispatch deliverability across all 8 integrated third-party APIs.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={runFullDiagnostics}
              disabled={isDiagnosingAll}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all shadow-md hover:shadow-primary/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isDiagnosingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{'Run Full Diagnostics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">{'Active Services'}</span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-text-main mt-2">{stats.activeCount}/8</div>
          <p className="text-2xs text-text-muted font-bold mt-0.5">{'Services Ready'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">{'SMS Sent'}</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-text-main mt-2">{stats.totalSmsSent}</div>
          <p className="text-2xs text-text-muted font-bold mt-0.5">{stats.totalSmsFailed} {'Failed'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">{'Emails Sent'}</span>
            <Mail className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-text-main mt-2">{stats.totalEmailSent}</div>
          <p className="text-2xs text-text-muted font-bold mt-0.5">{stats.totalEmailFailed} {'Failed'}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-color p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-black text-text-subtle uppercase tracking-widest">{'Courier Booked'}</span>
            <Truck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-text-main mt-2">{stats.steadfastBooked + stats.redxBooked}</div>
          <p className="text-2xs text-text-muted font-bold mt-0.5">{'Parcels Shipped'}</p>
        </div>
      </div>

      {/* 8 Core Services Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span>{'Live Gateway Health Matrix'}</span>
          </h3>
          <span className="text-xs text-text-subtle font-medium">{'Click "Ping" to test response time'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => {
            const Icon = svc.icon;
            const latencyData = serviceLatencies[svc.id];
            const isPinging = pingingServiceId === svc.id;
            
            // Determine active status
            const isOnline = latencyData?.status === 'online' || (svc.isConfigured && !latencyData);
            const isDegraded = latencyData?.status === 'degraded';

            return (
              <div 
                key={svc.id}
                className="bg-white rounded-2xl border border-border-color p-4.5 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${svc.bg} ${svc.color} flex items-center justify-center border ${svc.border} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-950 uppercase tracking-tight">
                          {svc.titleEn}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isOnline 
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' 
                              : isDegraded 
                              ? 'bg-rose-500' 
                              : svc.isConfigured 
                              ? 'bg-amber-500' 
                              : 'bg-zinc-300'
                          }`} />
                          <span className="text-2xs font-bold text-text-muted">
                            {isOnline 
                              ? ('ONLINE') 
                              : isDegraded 
                              ? ('ERROR') 
                              : svc.isConfigured 
                              ? ('STANDBY') 
                              : ('NOT CONFIGURED')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {latencyData?.latencyMs !== undefined && latencyData.latencyMs > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted text-2xs font-mono font-bold">
                        {latencyData.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-muted leading-snug font-medium">
                    {svc.descEn}
                  </p>

                  {latencyData?.message && (
                    <div className={`p-2 rounded-xl text-2xs font-medium leading-relaxed ${
                      isOnline ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                    }`}>
                      {latencyData.message}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => pingSingleService(svc.id)}
                    disabled={isPinging}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-surface-subtle hover:bg-zinc-200 text-text-main text-2xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isPinging ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>{'Ping Test'}</span>
                  </button>

                  {(svc.id === 'sms' || svc.id === 'email' || svc.id === 'gemini') && (
                    <button
                      onClick={() => setActiveSandbox(activeSandbox === svc.id ? null : (svc.id as any))}
                      className="py-1.5 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-2xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      title="Open Manual Test Sandbox"
                    >
                      <Play className="w-3 h-3" />
                      <span>{'Sandbox'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Test Sandboxes (Interactive Testing Tools) */}
      <NotificationSandbox
        activeSandbox={activeSandbox}
        onClose={() => setActiveSandbox(null)}
        triggerToast={triggerToast}
      />

      {/* Live Dispatch & Activity Logs Section */}
      <div className="bg-white rounded-3xl border border-border-color shadow-sm overflow-hidden">
        {/* Logs Header with Search & Filter Controls */}
        <div className="p-6 border-b border-zinc-100 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-950">
                  {'Live Dispatch & Audit Trail'}
                </h3>
                <p className="text-xs text-text-muted font-medium">
                  {'Real-time record of all automated SMS, emails, courier calls and background events'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-zinc-200 text-text-muted text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Export Logs as CSV"
              >
                <Download className="w-4 h-4" />
                <span>{'Export CSV'}</span>
              </button>

              <button
                onClick={() => setShowClearLogsConfirm(true)}
                className="p-2 rounded-xl text-text-subtle hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-border-color"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <ConfirmDialog
                open={showClearLogsConfirm}
                title="Clear All System Logs"
                message="Are you sure you want to permanently clear all system and delivery logs? This action cannot be undone."
                confirmLabel="Clear Logs"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={() => {
                  clearLogs();
                  triggerToast('Logs cleared');
                  setShowClearLogsConfirm(false);
                }}
                onCancel={() => setShowClearLogsConfirm(false)}
              />
            </div>
          </div>

          {/* Search, Channel & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 flex-wrap">
            {/* Channel Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Channels' },
                  { id: 'sms', label: 'SMS' },
                  { id: 'email', label: 'Email' },
                  { id: 'system', label: 'System' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannelFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                      activeChannelFilter === tab.id
                        ? 'bg-white text-zinc-950 shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'sent', label: 'Sent' },
                  { id: 'failed', label: 'Failed' },
                  { id: 'skipped', label: 'Skipped' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStatusFilter(tab.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeStatusFilter === tab.id
                        ? 'bg-surface-dark text-white shadow-xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={'Search logs (phone, email)...'}
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-border-color bg-surface-subtle text-xs font-medium focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Logs Table wrapped in ResponsiveTableContainer matching ProductsTab */}
        <ResponsiveTableContainer>
          <table className="w-full text-left text-xs font-sans whitespace-nowrap border-collapse min-w-[850px]">
            <thead className="bg-surface-subtle text-text-muted uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <tr>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle">{'Timestamp'}</th>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle">{'Channel'}</th>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle">{'Recipient'}</th>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle">{'Status'}</th>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle">{'Summary & Gateway'}</th>
                <th className="px-3 py-2 border-b border-r border-border-color bg-surface-subtle text-right">{'Action'}</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 border-b border-r border-border-color text-text-subtle font-bold text-xs uppercase tracking-wider">
                    {'No activity logs found for this criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-3 py-2 border-b border-r border-border-color whitespace-nowrap">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                        <span className="font-mono text-xs font-bold">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-2xs text-text-subtle block font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    <td className="px-3 py-2 border-b border-r border-border-color whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.channel === 'sms' ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-black uppercase text-text-main">{log.channel}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 border-b border-r border-border-color whitespace-nowrap">
                      <span className="font-mono font-bold text-text-main">{log.recipient}</span>
                    </td>

                    <td className="px-3 py-2 border-b border-r border-border-color whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-black uppercase ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'failed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-surface-subtle text-text-muted border border-border-color'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'sent' ? 'bg-emerald-500' : log.status === 'failed' ? 'bg-rose-500' : 'bg-zinc-400'
                        }`} />
                        <span>{log.status}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 border-b border-r border-border-color max-w-sm">
                      <p className="font-bold text-text-main leading-snug truncate">{log.summary}</p>
                      {log.details && (
                        <p className="text-2xs text-text-muted font-mono mt-0.5 truncate">{log.details}</p>
                      )}
                    </td>

                    <td className="px-3 py-2 border-b border-r border-border-color text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1 bg-surface-subtle hover:bg-zinc-200 text-text-muted text-xs font-bold transition-colors cursor-pointer rounded border border-border-color"
                      >
                        {'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTableContainer>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-border-color animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-dark text-white flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950">
                    {'Log Audit Details'}
                  </h3>
                  <p className="text-xs text-text-subtle font-mono">{selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-text-subtle hover:text-text-main hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-surface-subtle p-4 rounded-2xl border border-zinc-100">
                <div>
                  <span className="text-2xs font-bold text-text-subtle uppercase block">{'Channel'}</span>
                  <span className="font-black text-text-main uppercase">{selectedLog.channel}</span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-text-subtle uppercase block">{'Status'}</span>
                  <span className={`font-black uppercase ${selectedLog.status === 'sent' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-text-subtle uppercase block">{'Recipient'}</span>
                  <span className="font-mono font-bold text-text-main">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-2xs font-bold text-text-subtle uppercase block">{'Gateway Provider'}</span>
                  <span className="font-bold text-text-main">{selectedLog.provider || 'Default'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-2xs font-bold text-text-subtle uppercase block">{'Summary'}</span>
                <div className="p-3 bg-surface-subtle rounded-xl text-text-main font-medium">
                  {selectedLog.summary}
                </div>
              </div>

              {selectedLog.details && (
                <div className="space-y-1.5">
                  <span className="text-2xs font-bold text-text-subtle uppercase block">{'Payload & Response'}</span>
                  <pre className="p-3 bg-surface-dark text-white rounded-xl font-mono text-xs overflow-x-auto">
                    {selectedLog.details}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
              >
                {'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-2xl border border-border-dark flex items-center gap-3 animate-slide-up">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export { NotificationsTab as ServiceMonitoringTab };
