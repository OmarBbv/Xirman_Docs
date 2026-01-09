interface Props {
  label: string;
  options: string[];
  defaultValue?: string;
  className?: string;
}

export const Select = ({ label, options, defaultValue, className = "" }: Props) => {
  return (
    <div className={`relative group ${className}`}>
      <select
        defaultValue={defaultValue}
        className="w-full px-4 py-3.5 text-[16px] text-[#202124] bg-white border border-[#dadce0] rounded focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all outline-none appearance-none cursor-pointer peer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label className="absolute left-3 -top-2.5 px-1 bg-white text-[#1a73e8] text-[12px] transition-all pointer-events-none">
        {label}
      </label>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
