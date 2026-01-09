interface Props {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const Button = ({ children, type, className = "" }: Props) => {
  return (
    <button
      type={type}
      className={`cursor-pointer bg-[#1a73e8] hover:bg-[#1b66c9] text-white rounded shadow-sm transition-all active:shadow-none ${className}`}
    >
      {children}
    </button>
  );
};