/**
 * @file components/auth/CustomerAuthSection.tsx
 * @description Customer authentication section modularized into Login, Register, and Forgot Password modal.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  LogIn,
  UserPlus,
  X,
  Loader2,
  Truck
} from 'lucide-react';
import { CustomerLoginForm } from '@/components/auth/CustomerLoginForm';
import { CustomerRegisterForm } from '@/components/auth/CustomerRegisterForm';
import { CustomerForgotPasswordModal } from '@/components/auth/CustomerForgotPasswordModal';
import { Button } from '@/components/ui/Button';

interface CustomerAuthSectionProps {
  
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isGoogleLoading: boolean;
  isSubmittingAuth: boolean;
  handleGoogleSignIn: () => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  registerName: string;
  setRegisterName: (v: string) => void;
  registerEmail: string;
  setRegisterEmail: (v: string) => void;
  registerPassword: string;
  setRegisterPassword: (v: string) => void;
  showRegisterPassword: boolean;
  setShowRegisterPassword: (v: boolean) => void;
  registerPhone: string;
  setRegisterPhone: (v: string) => void;
  registerAddress: string;
  setRegisterAddress: (v: string) => void;
  handleRegisterSubmit: (e: React.FormEvent) => void;
  showForgotPasswordModal: boolean;
  setShowForgotPasswordModal: (v: boolean) => void;
  forgotPasswordEmail: string;
  setForgotPasswordEmail: (v: string) => void;
  forgotPasswordSent: boolean;
  setForgotPasswordSent: (v: boolean) => void;
}

export const CustomerAuthSection: React.FC<CustomerAuthSectionProps> = ({
    authMode,
  setAuthMode,
  authError,
  setAuthError,
  isGoogleLoading,
  isSubmittingAuth,
  handleGoogleSignIn,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  rememberMe,
  setRememberMe,
  handleLoginSubmit,
  registerName,
  setRegisterName,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  showRegisterPassword,
  setShowRegisterPassword,
  registerPhone,
  setRegisterPhone,
  registerAddress,
  setRegisterAddress,
  handleRegisterSubmit,
  showForgotPasswordModal,
  setShowForgotPasswordModal,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  forgotPasswordSent,
  setForgotPasswordSent,
}) => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-white font-sans flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Auth Mode Switcher */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-auth-mode-signin"
            type="button"
            onClick={() => {
              setAuthMode('login');
              setAuthError(null);
            }}
            className={`h-12 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98] ${
              authMode === 'login'
                ? 'bg-zinc-950 text-white shadow-xs border-2 border-zinc-950 font-black'
                : 'bg-white text-zinc-600 border border-zinc-300 hover:border-zinc-900 hover:text-zinc-950'
            }`}
          >
            <LogIn className={`w-4 h-4 transition-colors shrink-0 ${authMode === 'login' ? 'text-primary' : 'text-zinc-400'}`} />
            <span>{'Sign In'}</span>
          </button>

          <button
            id="btn-auth-mode-register"
            type="button"
            onClick={() => {
              setAuthMode('register');
              setAuthError(null);
            }}
            className={`h-12 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98] ${
              authMode === 'register'
                ? 'bg-zinc-950 text-white shadow-xs border-2 border-zinc-950 font-black'
                : 'bg-white text-zinc-600 border border-zinc-300 hover:border-zinc-900 hover:text-zinc-950'
            }`}
          >
            <UserPlus className={`w-4 h-4 transition-colors shrink-0 ${authMode === 'register' ? 'text-primary' : 'text-zinc-400'}`} />
            <span>{'Create Account'}</span>
          </button>
        </div>

        {/* Global Error Notice */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <Button 
              type="button" 
              variant="ghost"
              size="icon"
              onClick={() => setAuthError(null)}
              className="text-rose-400 hover:text-rose-700 p-0.5 cursor-pointer h-7 w-7 min-h-0 min-w-0 hover:bg-transparent"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Google One-Click Auth Button */}
        <div className="space-y-5">
          <button
            id="btn-google-auth"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmittingAuth}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 active:bg-zinc-100 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-75 group shadow-2xs"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>{'Connecting with Google...'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01 1 12 1 7.37 1 3.4 3.63 1.45 7.45l3.86 3C6.22 7.23 8.89 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.51z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.31 14.55c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.53 8.63 0 10.25 0 12s.53 3.37 1.45 5.05l3.86-3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.11 0-5.78-2.19-6.69-5.41l-3.86 3C3.4 20.37 7.37 23 12 23z"
                  />
                </svg>
                <span>
                  {authMode === 'login'
                    ? ('Continue with Google')
                    : ('Sign up with Google')}
                </span>
              </>
            )}
          </button>

          {/* Refined Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-eyebrow font-medium text-zinc-400 uppercase tracking-wider relative z-10">
              {'or'}
            </span>
          </div>
        </div>

        {/* Modular Login or Register Form */}
        {authMode === 'login' ? (
          <CustomerLoginForm
            
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            showLoginPassword={showLoginPassword}
            setShowLoginPassword={setShowLoginPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            handleLoginSubmit={handleLoginSubmit}
            isSubmittingAuth={isSubmittingAuth}
            onForgotPassword={() => setShowForgotPasswordModal(true)}
          />
        ) : (
          <CustomerRegisterForm
            
            registerName={registerName}
            setRegisterName={setRegisterName}
            registerEmail={registerEmail}
            setRegisterEmail={setRegisterEmail}
            registerPassword={registerPassword}
            setRegisterPassword={setRegisterPassword}
            showRegisterPassword={showRegisterPassword}
            setShowRegisterPassword={setShowRegisterPassword}
            registerPhone={registerPhone}
            setRegisterPhone={setRegisterPhone}
            registerAddress={registerAddress}
            setRegisterAddress={setRegisterAddress}
            handleRegisterSubmit={handleRegisterSubmit}
            isSubmittingAuth={isSubmittingAuth}
          />
        )}

        {/* Guest Order Tracking Quick Access */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-800">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>{'Ordered as a guest?'}</span>
            </div>
            <p className="text-2xs text-zinc-500">
              {'Track your package directly using Order ID and mobile number without signing in.'}
            </p>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-primary border border-primary/20 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <span>{'Track Your Order Now'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modular Forgot Password Modal */}
      <CustomerForgotPasswordModal
        
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false);
          setForgotPasswordSent(false);
        }}
        forgotPasswordEmail={forgotPasswordEmail}
        setForgotPasswordEmail={setForgotPasswordEmail}
        forgotPasswordSent={forgotPasswordSent}
        setForgotPasswordSent={setForgotPasswordSent}
        onSuccess={(email, newPass) => {
          setLoginEmail(email);
          setLoginPassword(newPass);
          setAuthMode('login');
          setShowForgotPasswordModal(false);
        }}
      />
    </div>
  );
};
