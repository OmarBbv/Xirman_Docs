import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslations } from "use-intl";
import { useLanguage } from "../../context/LanguageContext";
import { mockUser as user } from "../auth/mockUser";

const HomeIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const PostsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const t = useTranslations('Layout');
  const { locale, setLocale } = useLanguage();

  // Menu item-leri rollerine göre tanımlıyoruz
  const menuItems = [
    {
      name: t('dashboard'),
      path: "/dashboard",
      icon: <HomeIcon />,
      allowedRoles: []
    },
    { name: t('docs'), path: "/dashboard/docs", icon: <PostsIcon />, allowedRoles: [] },
    { name: t('users'), path: "/dashboard/users", icon: <UsersIcon />, allowedRoles: ["Direktor", "Admin"] },
    { name: t('settings'), path: "/dashboard/settings", icon: <SettingsIcon />, allowedRoles: [] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.allowedRoles.length === 0) return true;
    return user.isAuthenticated && item.allowedRoles.includes(user.role);
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#f0f0f1] font-sans text-[#1d2327]">
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

        {/* Menu Items */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (Admin Bar style) */}
        <header className="h-[32px] bg-[#1d2327] text-[#c3c4c7] flex items-center justify-between px-4 z-10">
          <div className="flex items-center space-x-4 h-full">
            <div className="hover:bg-white/10 h-full px-3 flex items-center cursor-pointer transition-colors">
              <span className="text-[13px]">Xirman DMS</span>
            </div>
            <div className="hidden md:flex hover:bg-white/10 h-full px-3 items-center cursor-pointer transition-colors space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" /></svg>
              <span className="text-[13px]">0 {t('notifications')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 h-full px-3">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "az" | "en")}
              className="bg-[#1d2327] text-white text-[13px] border border-gray-600 rounded px-2 py-0.5 focus:outline-none focus:border-white"
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
            </select>
            <div className="flex items-center cursor-pointer transition-colors space-x-2 hover:bg-white/10 px-2 py-1 rounded">
              <span className="text-[13px]">{t('greeting')}, <span className="font-bold">admin</span></span>
              <div className="w-5 h-5 rounded bg-gray-600"></div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-5 max-w-[1500px]">
          <header className="mb-6">
            <h1 className="text-[23px] font-normal text-[#1d2327]">{t('admin_panel')}</h1>
          </header>
          <div className="bg-white border border-[#c3c4c7] shadow-sm p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}