import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useUpdateUser } from "../hooks/userHooks";
import { useLanguage } from "../../context/LanguageContext";
import { message, Tabs } from "antd";
import { EyeIcon, EyeOffIcon } from "../ui/Icons";
import { useTranslations } from "use-intl";

type TabType = "profile" | "security" | "app";

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const { user } = useAuth();
  const { locale, setLocale } = useLanguage();
  const updateUser = useUpdateUser();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    position: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position || "",
      });
    }
  }, [user]);

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false
  });

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileSave = () => {
    if (!user) return;
    updateUser.mutate({
      id: user.id,
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        position: profileData.position,
      }
    });
  };

  const handlePasswordSave = () => {
    if (!user) return;
    if (passwords.newPass.length < 6) {
      message.error("Şifrə ən azı 6 simvol olmalıdır");
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      message.error("Şifrələr uyğun gəlmir");
      return;
    }

    updateUser.mutate({
      id: user.id,
      data: { password: passwords.newPass }
    }, {
      onSuccess: () => {
        setPasswords({ current: "", newPass: "", confirm: "" });
      }
    });
  };



  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg md:shadow-lg p-5 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-blue-100 text-xs md:text-sm">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 md:shadow-sm md:px-2">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabType)}
          size="middle"
          tabBarGutter={16}
          items={[
            {
              id: "profile",
              label: t("tabs.profile"),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )
            },
            {
              id: "security",
              label: t("tabs.security"),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )
            },
            {
              id: "app",
              label: t("tabs.app"),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            },
          ].map((tab) => ({
            key: tab.id,
            label: (
              <span className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            ),
          }))}
          className="px-0 md:px-4"
        />

        <div className="p-4 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8 max-w-3xl">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100 text-center md:text-left">
                <div className="uppercase w-24 h-24 rounded-full bg-linear-to-br from-[#2271b1] to-[#135e96] flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="text"
                  label={t("profile.firstName")}
                  placeholder={t("profile.firstName")}
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
                <Input
                  type="text"
                  label={t("profile.lastName")}
                  placeholder={t("profile.lastName")}
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
                <div className="md:col-span-2">
                  <Input
                    type="email"
                    label={t("profile.email")}
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <Input
                  type="text"
                  label={t("profile.position")}
                  value={
                    {
                      manager: "Menecer",
                      accountant: "Mühasib",
                      hr: "İnsan Resursları",
                      finance_manager: "Maliyyə Meneceri",
                      sales_specialist: "Satış Mütəxəssisi",
                      warehouseman: "Anbardar",
                      director: "Direktor",
                    }[profileData.position] || profileData.position
                  }
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">{t("profile.notSaved")}</p>
                <Button
                  onClick={handleProfileSave}
                  className="px-8 py-3 font-semibold shadow-sm"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending ? t("profile.saving") : t("profile.save")}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 max-w-3xl">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">{t("security.passwordSecurity")}</h4>
                  <p className="text-xs text-amber-700">{t("security.passwordHint")}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2271b1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {t("security.changePassword")}
                </h3>
                <div className="grid grid-cols-1 gap-5 max-w-md">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    label={t("security.currentPassword")}
                    placeholder={t("security.currentPassword")}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    suffix={
                      <button type="button" onClick={() => toggleVisibility('current')} className="focus:outline-none">
                        {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />
                  <Input
                    type={showPasswords.newPass ? "text" : "password"}
                    label={t("security.newPassword")}
                    placeholder={t("security.newPassword")}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    suffix={
                      <button type="button" onClick={() => toggleVisibility('newPass')} className="focus:outline-none">
                        {showPasswords.newPass ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    label={t("security.confirmPassword")}
                    placeholder={t("security.confirmPassword")}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    suffix={
                      <button type="button" onClick={() => toggleVisibility('confirm')} className="focus:outline-none">
                        {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                  />
                </div>
                <Button
                  onClick={handlePasswordSave}
                  className="px-8 py-3 font-semibold shadow-sm"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending ? t("security.pdating") : t("security.updatePassword")}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "app" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2271b1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {t("app.languageSelection")}
                </h3>
                <p className="text-sm text-gray-600 mb-6">{t("app.languageHint")}</p>

                <div className="space-y-3">
                  {[
                    { id: "az", label: "Azərbaycan dili", flag: "🇦🇿" },
                    { id: "ru", label: "Русский язык", flag: "🇷🇺" },
                    { id: "en", label: "English", flag: "🇬🇧", disabled: true },
                  ].map((lang) => (
                    <label
                      key={lang.id}
                      className={`flex items-center justify-between p-5 border-2 border-gray-200 rounded-lg transition-all group ${lang.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-[#2271b1] hover:bg-blue-50 has-[:checked]:border-[#2271b1] has-[:checked]:bg-blue-50'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{lang.label}</span>
                          {lang.disabled && <span className="text-xs text-gray-400">{t("app.soon")}</span>}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="lang"
                        checked={locale === lang.id}
                        disabled={lang.disabled}
                        onChange={() => {
                          if (lang.id === 'az' || lang.id === 'ru') {
                            setLocale(lang.id);
                          }
                        }}
                        className="w-5 h-5 text-[#2271b1] focus:ring-2 focus:ring-[#2271b1] cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}