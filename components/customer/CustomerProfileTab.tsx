'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, CheckCircle2 } from 'lucide-react';
import { User } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CustomerProfileTabProps {
  
  currentUser: User;
  profileName: string;
  setProfileName: (v: string) => void;
  profilePhone: string;
  setProfilePhone: (v: string) => void;
  profileAddress: string;
  setProfileAddress: (v: string) => void;
  profileAvatarUrl: string;
  setProfileAvatarUrl: (v: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void, folder: string) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  savedSuccess: boolean;
}

export const CustomerProfileTab: React.FC<CustomerProfileTabProps> = ({
    currentUser,
  profileName,
  setProfileName,
  profilePhone,
  setProfilePhone,
  profileAddress,
  setProfileAddress,
  profileAvatarUrl,
  setProfileAvatarUrl,
  handleImageUpload,
  handleSaveProfile,
  savedSuccess,
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-border-color/90 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6 font-sans">
      <div className="pb-3 border-b border-border-color flex items-center justify-between">
        <h2 className="font-sans text-lg font-bold text-text-main">
          {'Personal Profile & Settings'}
        </h2>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {'Changes Saved'}
          </span>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-text-muted block mb-2 font-sans">
              {'Profile Avatar Photo'}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-border-color bg-surface-subtle shrink-0">
                {profileAvatarUrl ? (
                  <Image 
                    src={profileAvatarUrl} 
                    alt={profileName ? `${profileName}'s profile avatar` : "Customer account profile avatar"} 
                    fill 
                    sizes="56px" 
                    className="object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-base">
                    {currentUser?.avatarLetter || 'U'}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="px-4 py-2 bg-surface-subtle hover:bg-zinc-200 text-text-muted border border-border-color rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{'Upload Avatar Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (url) => setProfileAvatarUrl(url), 'avatars')}
                  />
                </label>
                <p className="text-2xs text-text-subtle">JPG, PNG or WEBP. Uploads directly from device.</p>
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Full Name"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>
          
          <div>
            <Input
              label="Email Address (Read-only)"
              type="email"
              readOnly
              disabled
              value={currentUser.email}
              className="cursor-not-allowed bg-surface-subtle opacity-70"
            />
          </div>

          <div>
            <Input
              label="Mobile Contact"
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Delivery Address"
              type="text"
              value={profileAddress}
              onChange={(e) => setProfileAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex justify-end font-sans">
          <Button
            type="submit"
            variant="secondary"
            className="px-6 py-2.5 hover:bg-primary"
          >
            {'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
