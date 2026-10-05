'use client';

import React from 'react';
import { ClipboardList, Settings, Truck, CheckCircle2, Check } from 'lucide-react';

interface OrderTrackingTimelineProps {
  status: string;
  language?: string;
}

export function OrderTrackingTimeline({ status, language }: OrderTrackingTimelineProps) {
  const steps = [
    { key: 'Pending', label: 'Pending',  icon: ClipboardList },
    { key: 'Processing', label: 'Processing',  icon: Settings },
    { key: 'Shipped', label: 'Shipped',  icon: Truck },
    { key: 'Delivered', label: 'Delivered',  icon: CheckCircle2 },
  ];

  const statusIndexMap: Record<string, number> = {
    'Pending': 0,
    'Processing': 1,
    'Shipped': 2,
    'Delivered': 3,
  };

  const currentIndex = statusIndexMap[status] ?? 0;

  return (
    <div className="px-5 py-5 bg-zinc-50/50 border-y border-zinc-100">
      <div className="max-w-xl mx-auto">
        <h5 className="text-2xs sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 text-center">
          {'ORDER TRACKING STATUS'}
        </h5>
        
        <div className="relative flex items-center justify-between">
          {/* Connector Line */}
          <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-[3px] bg-zinc-200">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Timeline Steps */}
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                {/* Circle Icon Indicator */}
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-primary border-primary text-white shadow-xs' 
                      : isActive 
                        ? 'bg-white border-primary text-primary ring-4 ring-red-100/60 scale-105' 
                        : 'bg-white border-zinc-300 text-zinc-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Label */}
                <span 
                  className={`text-2xs sm:text-xs font-bold mt-2 transition-colors text-center px-1 whitespace-nowrap ${
                    isActive 
                      ? 'text-primary' 
                      : isCompleted 
                        ? 'text-zinc-800' 
                        : 'text-zinc-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
