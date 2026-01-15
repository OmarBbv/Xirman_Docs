import { useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useTranslations } from "use-intl";
import { HomeIcon, PostsIcon, UsersIcon, SettingsIcon } from "../ui/Icons";
import { useLanguage } from "../../context/LanguageContext";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { Badge, Popover, List, Empty } from "antd";
import { useDocuments } from "../hooks/documentHooks";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations('Layout');
  const { locale, setLocale } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification Logic
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const { data: notificationsData } = useDocuments({
    page: 1,
    limit: 5,
    startDate: dateString,
  });

  const notificationContent = (
    <div className="w-[300px]">
      <div className="flex justify-between items-center mb-2 px-2 pb-2 border-b border-gray-100">
        <span className="font-bold text-sm">Yeni Sənədlər (Bu gün)</span>
        <Link to="/dashboard/notifications" className="text-blue-600 text-xs hover:underline">Hamısına bax</Link>
      </div>
      {notificationsData?.data && notificationsData.data.length > 0 ? (
        <List
          size="small"
          dataSource={notificationsData.data}
          renderItem={(item) => (
            <div
              className="px-2 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              onClick={() => navigate(`/dashboard/docs/${item.id}`)}
            >
              <div className="font-medium text-xs text-gray-800 truncate">{item.companyName}</div>
              <div className="text-[10px] text-gray-500 flex justify-between mt-0.5">
                <span>{item.documentType}</span>
                <span>{new Date(item.uploadedAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Yeni bildiriş yoxdur" />
      )}
    </div>
  );

  const languageContent = (
    <div className="w-40">
      <button
        onClick={() => setLocale('az')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f0f0f1] transition-colors cursor-pointer flex items-center justify-between ${locale === 'az' ? 'font-bold text-[#2271b1] bg-blue-50' : 'text-[#1d2327]'}`}
      >
        <span className="flex items-center gap-2">🇦🇿 Azərbaycan</span>
        {locale === 'az' && <span className="text-[#2271b1]">✓</span>}
      </button>
      <button
        onClick={() => setLocale('ru')}
        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f0f0f1] transition-colors cursor-pointer flex items-center justify-between ${locale === 'ru' ? 'font-bold text-[#2271b1] bg-blue-50' : 'text-[#1d2327]'}`}
      >
        <span className="flex items-center gap-2">🇷🇺 Русский</span>
        {locale === 'ru' && <span className="text-[#2271b1]">✓</span>}
      </button>
    </div>
  );

  const profileContent = (
    <div className="w-48">
      <div className="px-4 py-2 border-b border-[#f0f0f1]">
        <p className="text-sm font-bold text-[#1d2327] truncate">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-[#50575e] truncate">{user?.email}</p>
      </div>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="w-full text-left px-4 py-2 text-sm text-[#d63638] hover:bg-[#f0f0f1] transition-colors cursor-pointer"
      >
        Çıxış et
      </button>
    </div>
  );

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

            <Popover content={notificationContent} trigger={['hover', 'click']} placement="bottomLeft" overlayClassName="notification-popover">
              <div className="hidden md:flex hover:bg-white/10 h-full px-3 items-center cursor-pointer transition-colors space-x-2">
                <Badge count={notificationsData?.total || 0} size="small" offset={[5, -8]} overflowCount={99}>
                  <svg className="w-4 h-4 text-[#c3c4c7]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" /></svg>
                </Badge>
                <span className="text-[13px]">{t('notifications')}</span>
              </div>
            </Popover>

          </div>
          <div className="flex items-center space-x-3 h-full px-3">
            <Popover content={languageContent} trigger={['hover', 'click']} placement="bottom">
              <div className="bg-[#1d2327] text-white text-[13px] border border-gray-600 rounded px-2 py-0.5 cursor-pointer hover:border-white transition-colors flex items-center gap-1 group">
                <span>{locale === 'az' ? 'AZ' : 'RU'}</span>
                <svg className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </Popover>

            <Popover content={profileContent} trigger={['hover', 'click']} placement="bottomRight">
              <div className="flex items-center cursor-pointer transition-colors space-x-2 hover:bg-white/10 px-2 py-1 h-full">
                <span className="text-[13px]">{t('greeting')}, <span className="font-bold">{user?.firstName || 'İstifadəçi'}</span></span>
                <div className="w-5 h-5 rounded bg-gray-600 flex items-center justify-center text-[10px] font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            </Popover>
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