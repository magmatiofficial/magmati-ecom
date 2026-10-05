'use client';

import React from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CustomerLoginFormProps {
  
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  isSubmittingAuth: boolean;
  onForgotPassword: () => void;
}

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({
    loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  rememberMe,
  setRememberMe,
  handleLoginSubmit,
  isSubmittingAuth,
  onForgotPassword,
}) => {
  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-muted block">
          {'Email'}
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <Mail className="w-4 h-4" />
          </span>
          <Input
            type="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="e.g. user@magmati.com"
            className="pl-10 h-12"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-text-muted">
            {'Password'}
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            {'Forgot password?'}
          </button>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <Lock className="w-4 h-4" />
          </span>
          <Input
            type={showLoginPassword ? 'text' : 'password'}
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10 pr-11 h-12"
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-subtle hover:text-text-main cursor-pointer"
          >
            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-text-main border-border-hover focus:ring-zinc-900 accent-zinc-900"
          />
          <span className="text-xs text-text-muted">
            {'Remember me'}
          </span>
        </label>
      </div>

      <Button
        type="submit"
        isLoading={isSubmittingAuth}
        variant="secondary"
        className="w-full h-11 mt-1 font-bold text-xs uppercase tracking-wider"
      >
        {'Sign In'}
      </Button>
    </form>
  );
};
