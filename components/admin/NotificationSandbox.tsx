'use client';

import React, { useState } from 'react';
import { 
  Play, 
  X, 
  Loader2, 
  Send
} from 'lucide-react';
import { authedFetchJson } from '@/lib/api/clientAuthFetch';
import { useNotificationLogStore } from '@/store/useNotificationLogStore';
import { InlineAlert } from '@/components/ui/InlineAlert';

interface NotificationSandboxProps {
  activeSandbox: 'sms' | 'email' | 'cloudinary' | 'courier' | null;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export const NotificationSandbox: React.FC<NotificationSandboxProps> = ({
  activeSandbox,
  onClose,
  triggerToast,
}) => {
  const { addLog } = useNotificationLogStore();

  // Test SMS form state
  const [testSmsPhone, setTestSmsPhone] = useState('01700000000');
  const [testSmsText, setTestSmsText] = useState('MAGMATI: আপনার অর্ডার #1024 সফলভাবে কনফার্ম হয়েছে। ধন্যবাদ!');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsTestResult, setSmsTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Test Email form state
  const [testEmailTo, setTestEmailTo] = useState('customer@example.com');
  const [testEmailSubject, setTestEmailSubject] = useState('MAGMATI Lifestyle: Order Invoice #1024');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Test SMS Execution
  const handleSendTestSms = async () => {
    if (!testSmsPhone.trim()) return;
    setIsSendingSms(true);
    setSmsTestResult(null);

    try {
      const res = await authedFetchJson<{ success: boolean; message?: string; error?: string; provider?: string }>('/api/admin/test-sms', {
        method: 'POST',
        body: JSON.stringify({
          phone: testSmsPhone,
          message: testSmsText,
        }),
      });

      if (!res.ok) {
        const errMsg = res.status === 401 ? 'Please log in again as admin.' : (res.data?.error || 'SMS test failed');
        setSmsTestResult({ success: false, msg: errMsg });
        addLog({
          channel: 'sms',
          eventType: 'test_message',
          recipient: testSmsPhone,
          status: 'failed',
          provider: 'SMS Gateway',
          summary: `Failed Test SMS to ${testSmsPhone}`,
          details: errMsg,
        });
        return;
      }

      const data = res.data;
      setSmsTestResult({
        success: !!data?.success,
        msg: data?.message || data?.error || 'SMS test completed',
      });

      addLog({
        channel: 'sms',
        eventType: 'test_message',
        recipient: testSmsPhone,
        status: data?.success ? 'sent' : 'failed',
        provider: data?.provider || 'SMS Gateway',
        summary: `Manual Test SMS to ${testSmsPhone}`,
        details: data?.message || data?.error,
      });

      if (data?.success) {
        triggerToast('✅ Test SMS sent successfully!');
      }
    } catch (e: any) {
      setSmsTestResult({ success: false, msg: e.message });
      addLog({
        channel: 'sms',
        eventType: 'test_message',
        recipient: testSmsPhone,
        status: 'failed',
        provider: 'SMS Gateway',
        summary: `Failed Test SMS to ${testSmsPhone}`,
        details: e.message,
      });
    } finally {
      setIsSendingSms(false);
    }
  };

  // Test Email Execution
  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim()) return;
    setIsSendingEmail(true);
    setEmailTestResult(null);

    try {
      const res = await authedFetchJson<{ success: boolean; message?: string; error?: string; provider?: string }>('/api/admin/test-email', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmailTo,
          subject: testEmailSubject,
          content: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:12px;">
            <h2 style="color:#e11d48;margin:0 0 10px 0;">MAGMATI Lifestyle</h2>
            <p>This is a live test notification from your store's admin gateway monitor.</p>
            <p style="font-size:12px;color:#888;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>`,
        }),
      });

      if (!res.ok) {
        const errMsg = res.status === 401 ? 'Please log in again as admin.' : (res.data?.error || 'Email test failed');
        setEmailTestResult({ success: false, msg: errMsg });
        addLog({
          channel: 'email',
          eventType: 'test_message',
          recipient: testEmailTo,
          status: 'failed',
          provider: 'Email Gateway',
          summary: `Failed Test Email to ${testEmailTo}`,
          details: errMsg,
        });
        return;
      }

      const data = res.data;
      setEmailTestResult({
        success: !!data?.success,
        msg: data?.message || data?.error || 'Email test completed',
      });

      addLog({
        channel: 'email',
        eventType: 'test_message',
        recipient: testEmailTo,
        status: data?.success ? 'sent' : 'failed',
        provider: data?.provider || 'Email Gateway',
        summary: `Manual Test Email: "${testEmailSubject}"`,
        details: data?.message || data?.error,
      });

      if (data?.success) {
        triggerToast('✅ Test Email sent successfully!');
      }
    } catch (e: any) {
      setEmailTestResult({ success: false, msg: e.message });
      addLog({
        channel: 'email',
        eventType: 'test_message',
        recipient: testEmailTo,
        status: 'failed',
        provider: 'Email Gateway',
        summary: `Failed Test Email to ${testEmailTo}`,
        details: e.message,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!activeSandbox) return null;

  return (
    <div className="bg-white rounded-3xl border border-primary/30 p-6 shadow-xl space-y-4 animate-scale-in">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight">
              {activeSandbox === 'sms' && ('📱 Live Test SMS Sandbox')}
              {activeSandbox === 'email' && ('✉️ Live Test Email Sandbox')}
            </h3>
            <p className="text-xs text-text-muted">
              {'Trigger live simulated or real dispatch to verify credential deliverability'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl text-text-subtle hover:text-text-muted hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* SMS Sandbox */}
      {activeSandbox === 'sms' && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-subtle uppercase tracking-wider block">
                {'Recipient Phone Number'}
              </label>
              <input
                type="text"
                value={testSmsPhone}
                onChange={(e) => setTestSmsPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-text-main text-xs font-mono font-bold focus:outline-hidden focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-subtle uppercase tracking-wider block">
                {'SMS Message Content'}
              </label>
              <input
                type="text"
                value={testSmsText}
                onChange={(e) => setTestSmsText(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-text-main text-xs font-medium focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-text-muted font-medium">
              {'Gateway and sender ID are configured on the server.'}
            </div>
            <button
              onClick={handleSendTestSms}
              disabled={isSendingSms}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSendingSms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{'Dispatch Test SMS'}</span>
            </button>
          </div>

          {smsTestResult && (
            <InlineAlert type={smsTestResult.success ? 'success' : 'error'}>{smsTestResult.msg}</InlineAlert>
          )}
        </div>
      )}

      {/* Email Sandbox */}
      {activeSandbox === 'email' && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-subtle uppercase tracking-wider block">
                {'Recipient Email Address'}
              </label>
              <input
                type="email"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder="customer@example.com"
                className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-text-main text-xs font-medium focus:outline-hidden focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-subtle uppercase tracking-wider block">
                {'Email Subject'}
              </label>
              <input
                type="text"
                value={testEmailSubject}
                onChange={(e) => setTestEmailSubject(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-text-main text-xs font-medium focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-text-muted font-medium">
              {'Sender address and provider are configured on the server.'}
            </div>
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingEmail}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{'Dispatch Test Email'}</span>
            </button>
          </div>

          {emailTestResult && (
            <InlineAlert type={emailTestResult.success ? 'success' : 'error'}>{emailTestResult.msg}</InlineAlert>
          )}
        </div>
      )}
    </div>
  );
};

