import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslations } from "use-intl";
import { HomeIcon, PostsIcon, UsersIcon, SettingsIcon } from "../ui/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations('Layout');
  const { locale, setLocale } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: t('dashboard'),
      path: "/dashboard",
      icon: <HomeIcon />,
      allowedRoles: ['admin']
    },
    { name: t('docs'), path: "/dashboard/docs", icon: <PostsIcon />, allowedRoles: [] },
    { name: t('users'), path: "/dashboard/users", icon: <UsersIcon />, allowedRoles: ['admin'] },
    { name: t('settings'), path: "/dashboard/settings", icon: <SettingsIcon />, allowedRoles: [] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.allowedRoles.length === 0) return true;
    return user && item.allowedRoles.includes(user.role);
  });

  return (
    <div className="flex h-screen bg-[#f0f0f1] font-sans text-[#1d2327]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} menuItems={filteredMenuItems} />

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
              onChange={(e) => setLocale(e.target.value as "az" | "ru")}
              className="bg-[#1d2327] text-white text-[13px] border border-gray-600 rounded px-2 py-0.5 focus:outline-none focus:border-white cursor-pointer"
            >
              <option value="az">AZ</option>
              <option value="ru">RU</option>
            </select>
            <div className="group relative flex items-center cursor-pointer transition-colors space-x-2 hover:bg-white/10 px-2 py-1 h-full">
              <span className="text-[13px]">{t('greeting')}, <span className="font-bold">{user?.firstName || 'İstifadəçi'}</span></span>
              <div className="w-5 h-5 rounded bg-gray-600 flex items-center justify-center text-[10px] font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-[32px] w-48 bg-white border border-[#c3c4c7] shadow-lg hidden group-hover:block z-50 py-1">
                <div className="px-4 py-2 border-b border-[#f0f0f1]">
                  <p className="text-sm font-bold text-[#1d2327] truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#50575e] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#d63638] hover:bg-[#f0f0f1] transition-colors"
                >
                  Çıxış et
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-5 max-w-[1800px]">
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