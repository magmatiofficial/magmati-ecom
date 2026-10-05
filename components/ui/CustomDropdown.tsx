'use client';

import React, { useState, useRef, useEffect, useMemo, KeyboardEvent } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  className,
  triggerClassName,
  dropdownClassName,
  disabled = false,
  error,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      setSearchTerm('');
      setFocusedIndex(-1);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens with many items
  useEffect(() => {
    if (isOpen && searchable && options.length > 8) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable, options.length]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
      triggerRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      if (isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
        e.preventDefault();
      }
      return;
    }

    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      setIsOpen(true);
      e.preventDefault();
      return;
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        e.preventDefault();
        const option = filteredOptions[focusedIndex];
        if (option && !option.disabled) {
          handleSelect(option);
        }
      }
    }
  };

  const isLargeList = searchable && options.length > 8;

  return (
    <div 
      className={cn('relative w-full group', className)} 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="text-2xs font-extrabold uppercase tracking-wider text-zinc-500 block ml-0.5 mb-1 font-sans">
          {label}
        </label>
      )}
      
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center justify-between w-full h-10 px-3.5 text-xs sm:text-sm text-left transition-colors duration-150 rounded-xl font-medium',
          'bg-white border border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50/70 shadow-2xs',
          isOpen ? 'border-zinc-400 bg-white shadow-xs ring-2 ring-primary/10' : '',
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 grayscale' : 'cursor-pointer',
          error ? 'border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/20' : '',
          triggerClassName
        )}
      >
        <div className="flex flex-col truncate min-w-0">
          <span className={cn('truncate', !selectedOption ? 'text-zinc-400 font-normal' : 'text-zinc-900 font-semibold')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.description && (
            <span className="text-2xs text-zinc-500 truncate font-normal leading-none mt-0.5">
              {selectedOption.description}
            </span>
          )}
        </div>
        
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-zinc-400 transition-transform duration-150 ease-out shrink-0 ml-1.5',
            isOpen ? 'rotate-180 text-zinc-700' : 'group-hover:text-zinc-600'
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 3, scale: 0.99 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.99 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={cn(
              'absolute z-[500] left-0 top-full mt-1 w-full min-w-[200px] bg-white border border-zinc-200/90 rounded-xl shadow-lg shadow-zinc-950/10 overflow-hidden py-1',
              dropdownClassName
            )}
          >
            {/* Search Input for large lists */}
            {isLargeList && (
              <div className="p-2 border-b border-zinc-100 sticky top-0 bg-white z-10">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-8 pl-8 pr-7 text-xs bg-zinc-50 border border-zinc-200/80 rounded-lg focus:outline-hidden focus:border-primary focus:bg-white transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div 
              role="listbox"
              className={cn(
                'max-h-[260px] overflow-y-auto p-1 custom-scrollbar space-y-0.5',
                filteredOptions.length === 0 ? 'flex items-center justify-center py-6' : ''
              )}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-4 text-center space-y-1">
                  <div className="text-xs text-zinc-500 font-medium">
                    No matching options
                  </div>
                </div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = option.value === value;
                  const isFocused = idx === focusedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 text-xs sm:text-sm transition-colors rounded-lg text-left relative font-medium group/item',
                        isSelected 
                          ? 'bg-zinc-100/90 text-zinc-950 font-semibold' 
                          : isFocused 
                          ? 'bg-zinc-100/70 text-zinc-900' 
                          : 'text-zinc-700 hover:bg-zinc-100/60 hover:text-zinc-900',
                        option.disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="text-2xs text-zinc-400 group-hover/item:text-zinc-500 truncate font-normal mt-0.5">
                            {option.description}
                          </span>
                        )}
                      </div>
                      
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-2xs font-semibold text-rose-500 ml-1 mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
};

