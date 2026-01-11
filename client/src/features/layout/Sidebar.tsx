import { Link, useLocation } from "react-router-dom";
import { mockUser as user } from "../auth/mockUser";
import { useTranslations } from "use-intl";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  menuItems: {
    name: string;
    path: string;
    icon: React.ReactNode;
    allowedRoles: string[];
  }[];
}

export const Sidebar = ({ isCollapsed, setIsCollapsed, menuItems }: Props) => {
  const location = useLocation();
  const t = useTranslations('Layout');

  const filteredMenuItems = menuItems.filter(item => {
    if (item.allowedRoles.length === 0) return true;
    return user.isAuthenticated && item.allowedRoles.includes(user.role);
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`${isCollapsed ? "w-[36px]" : "w-[160px]"
        } bg-[#1d2327] text-[#c3c4c7] flex flex-col transition-all duration-150 ease-in-out select-none border-r border-[#1d2327]`}
    >
      {/* WP Style Header/Logo Space */}
      <div className="h-[46px] flex items-center px-0.5 bg-black/10">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <span className="text-white text-xs font-bold leading-none">X</span>
        </div>
        {!isCollapsed && <span className="ml-2 font-bold text-[14px] text-white tracking-wide">XirmanDMS</span>}
      </div>

      <nav className="flex-1 mt-3">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center group h-[34px] transition-colors ${isActive(item.path)
              ? "bg-[#2271b1] text-white border-l-4 border-white ml-0px"
              : "hover:bg-white/5 hover:text-[#72aee6]"
              }`}
          >
            <div className={`flex items-center justify-center ${isCollapsed ? "w-full" : "w-[36px]"}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="text-[13px] font-medium leading-none">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="h-[36px] flex items-center bg-black/20 hover:text-white transition-colors"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {!isCollapsed && <span className="text-[12px] ml-1">{t('collapse_menu')}</span>}
      </button>
    </aside>
  );
};