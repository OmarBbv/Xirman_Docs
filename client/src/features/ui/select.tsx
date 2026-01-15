import { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | SelectOption)[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, options, className = "", error, ...props }, ref) => {
    return (
      <div className={`relative group ${className}`}>
        <select
          ref={ref}
          className={`w-full px-4 py-3.5 text-[16px] text-[#202124] bg-white border ${error ? "border-red-500" : "border-[#dadce0]"
            } rounded focus:outline-none focus:ring-2 ${error ? "focus:ring-red-200" : "focus:ring-[#4285F4]"
            } focus:border-transparent transition-all outline-none appearance-none cursor-pointer peer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
          {...props}
        >
          <option value="" disabled hidden></option>
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const labelText = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>
        <label
          className={`absolute left-4 top-3.5 ${error ? "text-red-500" : "text-[#5f6368]"
            } text-[16px] pointer-events-none transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[12px] ${error ? "peer-focus:text-red-500" : "peer-focus:text-[#1a73e8]"
            } peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1`}
        >
          {label}
        </label>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="text-red-500 text-[12px] mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
