'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingFilterListProps {
  
  minRating: number;
  onSelectMinRating: (rating: number) => void;
}

export const RatingFilterList: React.FC<RatingFilterListProps> = ({
    minRating,
  onSelectMinRating,
}) => {
  const ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '4.5★ & up', value: 4.5 },
    { label: '4.0★ & up', value: 4.0 },
    { label: '3.5★ & up', value: 3.5 },
  ];

  return (
    <div className="bg-surface-subtle border border-border-token rounded-2xl p-3.5 space-y-3 font-sans">
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" />
        <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
          {'Customer Rating'}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {ratingOptions.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onSelectMinRating(r.value)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              minRating === r.value
                ? 'bg-surface-active text-brand-gold shadow-xs'
                : 'bg-surface text-app-text hover:bg-surface-hover border border-border-token'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};
