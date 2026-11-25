'use client';

import { useState, useRef, useEffect } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';

/**
 * Custom Responsive Dropdown Component
 * Replaces native <select> with fully controlled UI
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of options {value, label}
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable the dropdown
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { playClickSound } = useSoundContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleSelect = (optionValue) => {
    playClickSound();
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
  if (!disabled) {
    playClickSound();
    setIsOpen(!isOpen);
  }
}}
        disabled={disabled}
        className={`
          w-full h-7 text-left px-3 sm:px-4 sm:py-2.5
          text-xs sm:text-sm
          border border-gray-400 bg-white
          rounded shadow-sm
          flex items-center justify-between
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#EBEEFA] focus:border-transparent
          transition-all duration-200
          ${isOpen ? 'ring-2 ring-[#EBEEFA] border-[#EBEEFA]' : ''}
        `}
      >
        <span className={`truncate ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
          {displayValue}
        </span>
        <svg
          className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-1
            bg-white border border-gray-300 rounded shadow-lg
            max-h-60 overflow-y-auto
            animate-in fade-in slide-in-from-top-1 duration-200
          `}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs sm:text-sm text-gray-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={`
                  w-full text-left px-3 py-2 sm:px-4 sm:py-2.5
                  text-xs sm:text-sm
                  transition-colors duration-150
                  ${option.disabled
                    ? 'text-gray-400 cursor-not-allowed opacity-60'
                    : 'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-900'
                  }
                  ${value === option.value && !option.disabled
                    ? 'bg-[#EBEEFA]/20 text-[#4682B4] font-medium'
                    : ''
                  }
                `}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

