'use client';

import React, { useState } from 'react';
import type { ReturnRequest } from '@/store/useReturnStore';
import { TrackReturnsList } from '@/components/returns/TrackReturnsList';

interface ReturnsTrackSectionProps {
  returnRequests: ReturnRequest[];
  setActiveTab: (tab: 'request' | 'track') => void;
  setMatchedReturn: (req: ReturnRequest | null) => void;
}

export const ReturnsTrackSection: React.FC<ReturnsTrackSectionProps> = ({
  returnRequests,
  setActiveTab,
  setMatchedReturn,
}) => {
  const [trackSearchTerm, setTrackSearchTerm] = useState('');

  const filteredReturnRequests = returnRequests.filter(
    (r) =>
      r.id.toLowerCase().includes(trackSearchTerm.toLowerCase()) ||
      r.orderId.toLowerCase().includes(trackSearchTerm.toLowerCase()) ||
      r.phone.includes(trackSearchTerm)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <TrackReturnsList
          filteredReturnRequests={filteredReturnRequests}
          trackSearchTerm={trackSearchTerm}
          setTrackSearchTerm={setTrackSearchTerm}
          setActiveTab={setActiveTab}
          setMatchedReturn={setMatchedReturn}
        />
      </div>
    </div>
  );
};
