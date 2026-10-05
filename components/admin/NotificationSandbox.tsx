'use client';

import React, { useState } from 'react';
import { 
  Play, 
  X, 
  Loader2, 
  Send, 
  Sparkles 
} from 'lucide-react';
import { useEnvConfigStore } from '@/store/useEnvConfigStore';
import { useNotificationLogStore } from '@/store/useNotificationLogStore';

interface NotificationSandboxProps {
  activeSandbox: 'sms' | 'email' | 'gemini' | 'cloudinary' | 'courier' | null;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export const NotificationSandbox: React.FC<NotificationSandboxProps> = ({
  activeSandbox,
  onClose,
  triggerToast,
}) => {
  const envConfig = useEnvConfigStore();
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

  // Test Gemini AI form state
  const [testGeminiPrompt, setTestGeminiPrompt] = useState('Write an attractive 2-line promotional description for a luxury cotton panjabi.');
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestOutput, setGeminiTestOutput] = useState<string | null>(null);

  // Test SMS Execution
  const handleSendTestSms = async () => {
    if (!testSmsPhone.trim()) return;
    setIsSendingSms(true);
    setSmsTestResult(null);

    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testSmsPhone,
          message: testSmsText,
          provider: envConfig.SMS_PROVIDER,
          apiKey: envConfig.SMS_API_KEY,
          senderId: envConfig.SMS_SENDER_ID
        })
      });
      const data = await res.json();
      setSmsTestResult({
        success: data.success,
        msg: data.message || data.error || 'SMS test completed'
      });

      addLog({
        channel: 'sms',
        eventType: 'test_message',
        recipient: testSmsPhone,
        status: data.success ? 'sent' : 'failed',
        provider: data.provider || envConfig.SMS_PROVIDER || 'SMS Gateway',
        summary: `Manual Test SMS to ${testSmsPhone}`,
        details: data.message || data.error,
      });

      if (data.success) {
        triggerToast('✅ Test SMS sent successfully!');
      }
    } catch (e: any) {
      setSmsTestResult({ success: false, msg: e.message });
      addLog({
        channel: 'sms',
        eventType: 'test_message',
        recipient: testSmsPhone,
        status: 'failed',
        provider: envConfig.SMS_PROVIDER || 'SMS Gateway',
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
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailTo,
          subject: testEmailSubject,
          content: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:12px;">
            <h2 style="color:#e11d48;margin:0 0 10px 0;">MAGMATI Lifestyle</h2>
            <p>This is a live test notification from your store's admin gateway monitor.</p>
            <p style="font-size:12px;color:#888;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>`,
          provider: envConfig.EMAIL_PROVIDER,
          apiKey: envConfig.EMAIL_API_KEY,
          fromAddress: envConfig.EMAIL_FROM_ADDRESS,
          fromName: envConfig.EMAIL_FROM_NAME
        })
      });
      const data = await res.json();
      setEmailTestResult({
        success: data.success,
        msg: data.message || data.error || 'Email test completed'
      });

      addLog({
        channel: 'email',
        eventType: 'test_message',
        recipient: testEmailTo,
        status: data.success ? 'sent' : 'failed',
        provider: data.provider || envConfig.EMAIL_PROVIDER || 'Email Gateway',
        summary: `Manual Test Email: "${testEmailSubject}"`,
        details: data.message || data.error,
      });

      if (data.success) {
        triggerToast('✅ Test Email sent successfully!');
      }
    } catch (e: any) {
      setEmailTestResult({ success: false, msg: e.message });
      addLog({
        channel: 'email',
        eventType: 'test_message',
        recipient: testEmailTo,
        status: 'failed',
        provider: envConfig.EMAIL_PROVIDER || 'Email Gateway',
        summary: `Failed Test Email to ${testEmailTo}`,
        details: e.message,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Test Gemini AI Execution
  const handleTestGemini = async () => {
    if (!testGeminiPrompt.trim()) return;
    setIsTestingGemini(true);
    setGeminiTestOutput(null);

    try {
      const res = await fetch('/api/admin/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: envConfig.GEMINI_API_KEY })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiTestOutput(data.text || 'Google Gemini AI responded OK.');
        triggerToast('✅ AI response received!');
      } else {
        setGeminiTestOutput(`Error: ${data.error || 'Failed to generate AI response'}`);
      }
    } catch (e: any) {
      setGeminiTestOutput(`Connection Error: ${e.message}`);
    } finally {
      setIsTestingGemini(false);
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
              {activeSandbox === 'gemini' && ('✨ Google Gemini AI Prompt Sandbox')}
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
              <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
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
              <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
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
              {`Gateway: ${envConfig.SMS_PROVIDER || 'Greenweb'} | Sender: [${envConfig.SMS_SENDER_ID || 'MAGMATI'}]`}
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
            <div className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed ${
              smsTestResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {smsTestResult.msg}
            </div>
          )}
        </div>
      )}

      {/* Email Sandbox */}
      {activeSandbox === 'email' && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
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
              <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
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
              {`From: ${envConfig.EMAIL_FROM_ADDRESS || 'orders@magmati.com'} (${envConfig.EMAIL_PROVIDER || 'Resend'})`}
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
            <div className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed ${
              emailTestResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {emailTestResult.msg}
            </div>
          )}
        </div>
      )}

      {/* Gemini AI Sandbox */}
      {activeSandbox === 'gemini' && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-2xs font-black text-text-subtle uppercase tracking-wider block">
              {'Test AI Prompt'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testGeminiPrompt}
                onChange={(e) => setTestGeminiPrompt(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl border border-border-color bg-surface-subtle text-text-main text-xs font-medium focus:outline-hidden focus:border-primary"
              />
              <button
                onClick={handleTestGemini}
                disabled={isTestingGemini}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isTestingGemini ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{'Run Prompt'}</span>
              </button>
            </div>
          </div>

          {geminiTestOutput && (
            <div className="p-4 rounded-2xl bg-surface-dark text-white font-mono text-xs leading-relaxed border border-border-dark space-y-1">
              <span className="text-2xs font-bold text-primary block uppercase">Gemini AI Output:</span>
              <p>{geminiTestOutput}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
