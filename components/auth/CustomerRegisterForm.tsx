'use client';

import React from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomerRegisterFormProps {
  
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
  isSubmittingAuth: boolean;
}

export const CustomerRegisterForm: React.FC<CustomerRegisterFormProps> = ({
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
  isSubmittingAuth,
}) => {
  return (
    <form onSubmit={handleRegisterSubmit} className="space-y-3.5 font-sans">
      <div className="space-y-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <UserIcon className="w-4 h-4" />
          </span>
          <Input
            label="Full Name *"
            type="text"
            required
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            placeholder="e.g. Asif Chowdhury"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <Mail className="w-4 h-4" />
          </span>
          <Input
            label="Email *"
            type="email"
            required
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="name@example.com"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <Lock className="w-4 h-4" />
          </span>
          <Input
            label="Password *"
            type={showRegisterPassword ? 'text' : 'password'}
            required
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="•••••••• (Min. 4 characters)"
            className="pl-10 pr-11 h-11"
          />
          <button
            type="button"
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
            className="absolute right-3.5 top-8 flex items-center text-text-subtle hover:text-text-main cursor-pointer"
          >
            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <Phone className="w-4 h-4" />
          </span>
          <Input
            label="Mobile Phone (Optional)"
            type="tel"
            value={registerPhone}
            onChange={(e) => setRegisterPhone(e.target.value)}
            placeholder="+880 1712-345678"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-subtle z-10">
            <MapPin className="w-4 h-4" />
          </span>
          <Input
            label="Delivery Address (Optional)"
            type="text"
            value={registerAddress}
            onChange={(e) => setRegisterAddress(e.target.value)}
            placeholder="e.g. Dhanmondi, Dhaka"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isSubmittingAuth}
        variant="secondary"
        className="w-full h-11 mt-2 font-bold text-xs uppercase tracking-wider animate-fadeIn"
      >
        {'Create Account'}
      </Button>
    </form>
  );
};
