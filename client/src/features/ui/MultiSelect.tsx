import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XIcon } from './Icons';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  allowClear = true,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = value
    .map((v) => options.find((opt) => opt.value === v))
    .filter(Boolean) as Option[];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between
          w-full h-[50px] px-3
          bg-white border rounded-lg
          cursor-pointer
          transition-all duration-200
          ${isOpen ? 'border-[#1a73e8] shadow-[0_0_0_2px_rgba(26,115,232,0.2)]' : 'border-gray-300 hover:border-[#1a73e8]'}
        `}
      >
        <div className="flex items-center flex-1 overflow-hidden h-full">
          {selectedLabels.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden">
              {selectedLabels.slice(0, 2).map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f0f5ff] text-[#1a73e8] text-xs rounded border border-[#d6e4ff]"
                >
                  {opt.label}
                  <button
                    onClick={(e) => removeOption(opt.value, e)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedLabels.length > 2 && (
                <span className="text-xs text-gray-500">+{selectedLabels.length - 2}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {allowClear && value.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <XIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      <div
        className={`
          absolute z-50 w-full mt-1
          bg-white border border-gray-200 rounded-lg shadow-lg
          overflow-hidden
          transition-all duration-200 origin-top
          ${isOpen
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
          }
        `}
      >
        <div className="max-h-[200px] overflow-y-auto py-1">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer
                  transition-colors duration-150
                  ${isSelected ? 'bg-[#e6f4ff]' : 'hover:bg-gray-50'}
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded border flex items-center justify-center
                    transition-all duration-150
                    ${isSelected
                      ? 'bg-[#1a73e8] border-[#1a73e8]'
                      : 'border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${isSelected ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
