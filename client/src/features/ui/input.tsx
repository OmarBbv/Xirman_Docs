interface Props {
  type: string;
  placeholder: string;
  label: string;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  required?: boolean;
}

export const Input = ({ type, placeholder, label, disabled, defaultValue, className = "", required = false }: Props) => {
  return (
    <div className={`relative group ${className}`}>
      <input
        type={type}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        className={`w-full px-4 py-3.5 text-[16px] text-[#202124] bg-white border border-[#dadce0] rounded focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all placeholder:text-transparent peer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0`}
        placeholder={placeholder}
        min={1}
      />
      <label className="absolute left-4 top-3.5 text-[#5f6368] text-[16px] pointer-events-none transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[12px] peer-focus:text-[#1a73e8] peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
        {label}
      </label>
    </div>
  )
}