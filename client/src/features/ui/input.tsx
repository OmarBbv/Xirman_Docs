interface Props {
  type: string;
  placeholder: string;
  label: string;
}

export const Input = ({ type, placeholder, label }: Props) => {
  return (
    <div className="relative group">
      <input
        type={type}
        required
        className="w-full px-4 py-3.5 text-[16px] text-[#202124] bg-white border border-[#dadce0] rounded focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent transition-all placeholder:text-transparent peer"
        placeholder={placeholder}
      />
      <label className="absolute left-4 top-3.5 text-[#5f6368] text-[16px] pointer-events-none transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[12px] peer-focus:text-[#1a73e8] peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
        {label}
      </label>
    </div>
  )
}