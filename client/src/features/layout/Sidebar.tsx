import { Link, useLocation } from "react-router-dom";
import { useTranslations, useLocale } from "use-intl";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  menuItems: {
    name: string;
    path: string;
    icon: React.ReactNode;
    allowedRoles: string[];
  }[];
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed, menuItems, mobile = false, onClose }: Props) => {
  const location = useLocation();
  const t = useTranslations('Layout');
  const locale = useLocale();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`${isCollapsed ? "w-[36px]" : mobile ? "w-full" : "w-[160px]"
        } bg-[#1d2327] text-[#c3c4c7] flex flex-col transition-all duration-150 ease-in-out select-none border-r border-[#1d2327]`}
    >
      <div className="h-[46px] flex items-center justify-between px-2 bg-black/10">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <span className="text-white text-xs font-bold leading-none">X</span>
          </div>
          {!isCollapsed && <span className="ml-2 font-bold text-[14px] text-white tracking-wide">{locale === 'ru' ? 'ХирманЭАС' : 'XirmanEAS'}</span>}
        </div>

        {mobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 mt-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center group ${mobile ? 'h-[50px] px-2' : 'h-[34px]'} transition-colors ${isActive(item.path)
              ? "bg-[#2271b1] text-white border-l-4 border-white ml-0px"
              : "hover:bg-white/5 hover:text-[#72aee6]"
              }`}
          >
            <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : "w-[36px]"}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className={`${mobile ? 'text-[16px] ml-2' : 'text-[13px]'} font-medium leading-none`}>
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {!mobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-[36px] flex items-center bg-black/20 hover:text-white transition-colors"
          title={isCollapsed ? t('expand_menu') : t('collapse_menu')}
        >
          <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span className="text-[12px] ml-1">{t('collapse_menu')}</span>}
        </button>
      )}
    </aside>
  );
};