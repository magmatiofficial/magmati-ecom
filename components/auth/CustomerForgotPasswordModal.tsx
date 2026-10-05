'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  X, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { dispatchOtpNotification } from '@/lib/notificationEngine';

interface CustomerForgotPasswordModalProps {
  
  isOpen: boolean;
  onClose: () => void;
  forgotPasswordEmail: string;
  setForgotPasswordEmail: (v: string) => void;
  forgotPasswordSent?: boolean;
  setForgotPasswordSent?: (v: boolean) => void;
  onSuccess?: (email: string, newPassword: string) => void;
}

export const CustomerForgotPasswordModal: React.FC<CustomerForgotPasswordModalProps> = ({
    isOpen,
  onClose,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  onSuccess,
}) => {
  const { requestPasswordReset, resetPasswordWithCode } = useAuthStore();

  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('email');
    setResetCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    onClose();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const email = forgotPasswordEmail.trim().toLowerCase();
    const res = await requestPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setStep('success');
    } else {
      setErrorMessage(
        res.error || 'Failed to request password reset. Please verify your email and try again.'
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 4) {
      setErrorMessage(
        'New password must be at least 4 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsLoading(true);
    const email = forgotPasswordEmail.trim().toLowerCase();
    const res = await resetPasswordWithCode(email, resetCode.trim(), newPassword);
    setIsLoading(false);

    if (res.success) {
      setStep('success');
    } else {
      setErrorMessage(
        res.error || 'Invalid or expired verification code.'
      );
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-hover to-secondary" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
            {step === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
              {step === 'email' && ('Forgot Password?')}
              {step === 'code' && ('Set New Password')}
              {step === 'success' && ('Password Reset Complete!')}
            </h3>
            <p className="text-2xs sm:text-xs text-zinc-500">
              {step === 'email' && ('Enter your email to receive a recovery code')}
              {step === 'code' && ('Enter verification code & create password')}
              {step === 'success' && ('You can now sign in with your new password')}
            </p>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-fadeIn flex items-center justify-between">
            <span>{errorMessage}</span>
            <button 
              type="button" 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-400 hover:text-rose-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* STEP 1: Enter Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-zinc-500 uppercase tracking-wider block">
                {'Registered Email Address *'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="e.g. user@magmati.com"
                  className="w-full h-12 pl-10 pr-4 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 text-2xs text-zinc-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                An instant 6-digit security verification code will be generated for quick account recovery.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{'Verifying Email...'}</span>
                </>
              ) : (
                <>
                  <span>{'Get Recovery Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password Form */}
        {step === 'code' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Generated Code Notification Banner */}
            {generatedCode && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider block">
                    {'Your 6-Digit Verification Code'}
                  </span>
                  <span className="font-mono text-base font-black text-amber-950 tracking-widest">
                    {generatedCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-lg text-2xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Code Input */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'Verification Code *'}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="6-digit OTP code"
                className="w-full h-11 px-3.5 text-center font-mono text-base font-bold tracking-widest bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary transition-all text-zinc-900"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'New Password *'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full h-11 pl-10 pr-10 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary transition-all text-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'Confirm New Password *'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 pl-10 pr-10 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-primary transition-all text-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit & Back Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-zinc-950 hover:bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{'Updating Password...'}</span>
                  </>
                ) : (
                  <span>{'Confirm Password Reset'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMessage(null);
                }}
                className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{'Change Email'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
              <p className="leading-relaxed font-semibold">
                If an account exists for <span className="font-bold underline">{forgotPasswordEmail}</span>, a secure password reset link has been dispatched to your email inbox.
              </p>
              <p className="text-2xs text-emerald-700">
                Please check your email and follow the provided link to set a new password.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{'Back to Sign In'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
