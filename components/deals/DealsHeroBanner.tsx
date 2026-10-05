'use client';

import React from 'react';
import { Flame, Clock } from 'lucide-react';

interface DealsHeroBannerProps {
  
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  timeSlots: Array<{
    id: number;
    time: string;
    statusEn: string;
    active: boolean;
    tag: string;
  }>;
  activeSlot: number;
  setActiveSlot: (slotId: number) => void;
}

export const DealsHeroBanner: React.FC<DealsHeroBannerProps> = ({
    timeLeft,
  timeSlots,
  activeSlot,
  setActiveSlot,
}) => {
  return (
    <>
      {/* Cinematic Flash Banner */}
      <section className="relative bg-gradient-to-br from-secondary via-zinc-900 to-zinc-950 text-white border-b border-zinc-800/90 pt-8 pb-14 sm:pb-18 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/25 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-subtle border border-primary/50 text-primary-light text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <Flame className="w-4 h-4 text-primary fill-primary" />
              <span>{'MAGMATI FLASH FEST • LIMITED DEALS'}</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
              {'Unstoppable Flash Steals'}
            </h1>

            <p className="text-xs sm:text-base text-zinc-300 max-w-xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed">
              {'Save big on genuine lifestyle essentials with hourly drops, verified stock, and instant door-to-door delivery.'}
            </p>

            {/* Countdown Box */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 bg-secondary/90 border border-zinc-700/80 p-3 sm:p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-bold uppercase tracking-wider sm:pr-4 sm:border-r sm:border-zinc-700">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
                <span>{'Round Ends In:'}</span>
              </div>

              <div className="flex items-center gap-2 text-center">
                <div className="bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 min-w-14">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400">Hours</span>
                </div>
                <span className="text-zinc-500 font-bold text-lg">:</span>
                <div className="bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 min-w-14">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-2xs font-semibold uppercase tracking-wider text-zinc-400">Mins</span>
                </div>
                <span className="text-zinc-500 font-bold text-lg">:</span>
                <div className="bg-zinc-950 px-3.5 py-2 rounded-xl border border-primary/60 min-w-14">
                  <span className="font-mono text-xl sm:text-2xl font-black text-primary">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-2xs font-semibold uppercase tracking-wider text-primary">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Shift Timeline Navigation Bar */}
      <section className="bg-zinc-900 border-b border-zinc-800 sticky top-14 sm:top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 divide-x divide-zinc-800">
            {timeSlots.map((slot) => {
              const isSelected = activeSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setActiveSlot(slot.id)}
                  className={`relative py-3 sm:py-4 px-2 sm:px-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-primary text-app-inverse shadow-inner'
                      : 'hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-base font-black font-mono tracking-tight text-white">
                      {slot.time}
                    </span>
                    {slot.tag && (
                      <span className={`hidden sm:inline-block text-2xs font-extrabold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-primary'
                      }`}>
                        {slot.tag}
                      </span>
                    )}
                  </div>
                  <span className={`text-2xs sm:text-xs font-semibold mt-0.5 ${
                    isSelected ? 'text-primary-light font-bold' : 'text-zinc-500'
                  }`}>
                    {slot.statusEn}
                  </span>

                  {/* Active Indicator Arrow */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
