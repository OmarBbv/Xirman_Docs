interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className = "", ...props }: Props) => {
  return (
    <button
      {...props}
      className={`cursor-pointer bg-[#1a73e8] hover:bg-[#1b66c9] text-white rounded shadow-sm transition-all active:shadow-none disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};