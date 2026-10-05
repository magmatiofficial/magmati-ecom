'use client';

import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  MessageCircle, 
  Send, 
  Share2,
  Globe
} from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { cleanWhatsAppNumber } from '@/lib/utils';

interface FooterSocialIconsProps {
  
}

export const FooterSocialIcons: React.FC<FooterSocialIconsProps> = () => {
  const { 
    facebookUrl, 
    instagramUrl, 
    youtubeUrl, 
    tiktokUrl, 
    linkedinUrl, 
    whatsappNumber 
  } = useSiteSettingsStore();

  const socialLinks = [
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@magmatilifestyle',
      followers: '120K+ Fans',
      url: facebookUrl || 'https://facebook.com/magmatilifestyle',
      color: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white',
      badgeBg: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@magmati_official',
      followers: '45K+ Reels',
      url: instagramUrl || 'https://instagram.com/magmati_official',
      color: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent hover:text-white',
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@magmatilifestyle',
      followers: '30K+ Subs',
      url: youtubeUrl || 'https://youtube.com/@magmatilifestyle',
      color: 'hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@magmatilifestyle',
      followers: '85K+ Views',
      url: tiktokUrl || 'https://tiktok.com/@magmatilifestyle',
      color: 'hover:bg-[#000000] hover:border-[#00f2fe] hover:text-[#00f2fe]',
      badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.42c0 1.95-.5 3.93-1.62 5.51-1.39 1.97-3.6 3.2-6.02 3.4-2.58.21-5.22-.61-7.06-2.42-2-1.97-2.92-4.88-2.47-7.66.42-2.61 2.12-4.88 4.54-5.94 1.48-.65 3.14-.85 4.74-.59v4.13c-.92-.26-1.93-.24-2.83.08-1.07.38-1.92 1.25-2.28 2.34-.41 1.25-.13 2.68.72 3.65.86.99 2.21 1.48 3.53 1.29 1.34-.18 2.47-1.12 2.87-2.41.13-.42.19-.87.19-1.31V.02z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: 'Live Order Support',
      followers: 'Online 24/7',
      url: `https://wa.me/${cleanWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent('Hi MAGMATI, I need order help.')}`,
      color: 'hover:bg-[#25D366] hover:border-[#25D366] hover:text-white',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: (
        <MessageCircle className="w-4 h-4" />
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Corporate HQ',
      followers: 'Careers & News',
      url: linkedinUrl || 'https://linkedin.com/company/magmatilifestyle',
      color: 'hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white',
      badgeBg: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <h5 className="text-xs uppercase tracking-widest text-zinc-300 font-bold font-sans">
          {'CONNECT ON SOCIAL MEDIA'}
        </h5>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {socialLinks.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className={`w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 ${social.color} transition-all duration-200 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 group relative`}
            title={`${social.name} (${social.followers})`}
            aria-label={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>

      <p className="text-2xs text-zinc-400 font-sans">
        {'Follow our official channels for exclusive giveaways & lookbooks.'}
      </p>
    </div>
  );
};
