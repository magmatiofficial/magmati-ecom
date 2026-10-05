'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Bell, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2, 
  KeyRound,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface CustomerSettingsTabProps {
  savedSuccess: boolean;
  setSavedSuccess: (val: boolean) => void;
}

export const CustomerSettingsTab: React.FC<CustomerSettingsTabProps> = ({
  savedSuccess,
  setSavedSuccess,
}) => {
  const { currentUser, changePassword, logoutUser } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (!currentPassword) {
      setPassError('Enter your current password.');
      return;
    }

    if (newPassword.length < 4) {
      setPassError(
        'New password must be at least 4 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(
        'New passwords do not match.'
      );
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } else {
      setPassError(
        res.error || 
        ('Failed to update password. Please check your current password.')
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6 font-sans">
      <div className="pb-3 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h2 className="font-sans text-lg font-bold text-text-main">
            App Settings & Security
          </h2>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>

      {/* Password Change / Security Section */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                {'Change Password & Security'}
              </h3>
            </div>
          </div>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{'Password updated successfully!'}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'Current Password *'}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-9 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'New Password *'}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full h-10 px-3 pr-9 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-zinc-600 uppercase tracking-wider block">
                {'Confirm Password *'}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-10 px-3 pr-9 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2 active:scale-95"
            >
              {isChangingPass ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>{'Updating...'}</span>
                </>
              ) : (
                <span>{'Update Password'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-xs font-bold text-zinc-900">
              {'Order Updates & Notifications'}
            </h3>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-zinc-700">
              {'SMS Order Tracking Alerts'}
            </span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded cursor-pointer" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-zinc-700">
              {'Exclusive Discount Email Alerts'}
            </span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary rounded cursor-pointer" />
          </label>
        </div>
      </div>

      {/* Account Session & Sign Out */}
      <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                {'Account Session'}
              </h3>
              <p className="text-2xs text-zinc-500 mt-0.5">
                {'Sign out of your customer account on this browser.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              if (typeof window !== 'undefined') {
                window.location.href = '/account';
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
