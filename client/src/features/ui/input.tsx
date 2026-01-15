import { forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  status?: "error" | "warning";
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, status, suffix, className = "", ...props }, ref) => {
    const hasError = !!error || status === "error";
    return (
      <div className={`relative group ${className}`}>
        <input
          ref={ref}
          {...props}
          className={`w-full px-4 py-3.5 text-[16px] text-[#202124] bg-white border ${hasError ? "border-red-500" : "border-[#dadce0]"
            } rounded focus:outline-none focus:ring-2 ${hasError ? "focus:ring-red-200" : "focus:ring-[#4285F4]"
            } focus:border-transparent transition-all placeholder:text-transparent peer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 ${suffix ? "pr-10" : ""
            }`}
          placeholder={props.placeholder || label}
        />
        <label
          className={`absolute left-4 top-3.5 ${hasError ? "text-red-500" : "text-[#5f6368]"
            } text-[16px] pointer-events-none transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[12px] ${hasError ? "peer-focus:text-red-500" : "peer-focus:text-[#1a73e8]"
            } peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1`}
        >
          {label}
        </label>
        {suffix && (
          <div className="absolute right-3 top-3.5 text-gray-500 cursor-pointer z-10">
            {suffix}
          </div>
        )}
        {error && <p className="text-red-500 text-[12px] mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";