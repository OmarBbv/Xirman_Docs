import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type TabType = "profile" | "security" | "app";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const sessionLogs = [
    { id: 1, ip: "192.168.1.45", date: "2024/01/09 10:24", status: "Aktiv" },
    { id: 2, ip: "172.20.10.2", date: "2024/01/08 14:15", status: "Bağlanıb" },
    { id: 3, ip: "192.168.1.45", date: "2024/01/07 09:40", status: "Bağlanıb" },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Ayarlar</h1>
      </header>

      <div className="flex border-b border-[#c3c4c7] mb-8 bg-white/50">
        {[
          { id: "profile", label: "Şəxsi Məlumatlar" },
          { id: "security", label: "Təhlükəsizlik" },
          { id: "app", label: "Tətbiq Tənzimləmələri" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-6 py-3 text-sm font-medium transition-all relative cursor-pointer ${activeTab === tab.id
              ? "text-[#2271b1] border-b-2 border-[#2271b1] bg-white"
              : "text-[#50575e] hover:text-[#2271b1] hover:bg-white/40"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#c3c4c7] shadow-sm p-8 rounded-sm">
        {activeTab === "profile" && (
          <div className="space-y-8 max-w-2xl">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                AD
              </div>
              <div className="space-y-2">
                <Button className="py-2 px-4 text-xs bg-white text-[#2271b1] border border-[#2271b1] hover:bg-[#f0f6fa]">
                  Şəkli dəyiş
                </Button>
                <p className="text-[11px] text-[#50575e]">Maksimal ölçü 2MB. Format: JPG, PNG</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input type="text" label="Ad" placeholder="Ad" defaultValue="Admin" />
              <Input type="text" label="Soyad" placeholder="Soyad" defaultValue="User" />
              <Input type="email" label="E-mail" placeholder="E-mail" defaultValue="admin@xirman.az" disabled className="md:col-span-2" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button className="px-8 py-3 font-semibold">Yadda saxla</Button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-8">
            <div className="max-w-md space-y-6">
              <h3 className="text-lg font-bold text-[#1d2327]">Şifrəni Dəyiş</h3>
              <Input type="password" label="Cari şifrə" placeholder="Cari şifrə" />
              <Input type="password" label="Yeni şifrə" placeholder="Yeni şifrə" />
              <Input type="password" label="Yeni şifrə (Təkrar)" placeholder="Yeni şifrə (Təkrar)" />
              <Button className="px-8 py-3 font-semibold">Şifrəni Yenilə</Button>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-[#1d2327] mb-4">Son Giriş Hərəkətləri</h3>
              <div className="border border-[#c3c4c7] rounded-sm overflow-hidden">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7]">
                      <th className="p-3 font-bold">IP Ünvanı</th>
                      <th className="p-3 font-bold">Tarix</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionLogs.map((log) => (
                      <tr key={log.id} className="border-b border-[#f0f0f1] last:border-0 hover:bg-[#f6f7f7] transition-colors">
                        <td className="p-3 font-medium text-[#2271b1]">{log.ip}</td>
                        <td className="p-3 text-[#50575e]">{log.date}</td>
                        <td className="p-3">
                          <span className={`${log.status === "Aktiv" ? "text-green-600 font-bold" : "text-gray-400"}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "app" && (
          <div className="space-y-8 max-w-md">
            <div>
              <h3 className="text-lg font-bold text-[#1d2327] mb-2">Dil Seçimi</h3>
              <p className="text-sm text-[#50575e] mb-6">Sistemin interfeys dilini seçin.</p>

              <div className="space-y-3">
                {[
                  { id: "az", label: "Azərbaycan dili", flag: "🇦🇿" },
                  { id: "ru", label: "Русский язык", flag: "🇷🇺" },
                ].map((lang) => (
                  <label key={lang.id} className="flex items-center justify-between p-4 border border-[#dadce0] rounded-lg cursor-pointer hover:bg-[#f0f6fa] transition-all group has-[:checked]:border-[#2271b1] has-[:checked]:bg-[#f0f6fa]">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-[#202124]">{lang.label}</span>
                    </div>
                    <input type="radio" name="lang" defaultChecked={lang.id === "az"} className="w-4 h-4 text-[#2271b1] focus:ring-[#2271b1] cursor-pointer" />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button className="px-8 py-3 font-semibold">Deşiklikləri Yadda Saxla</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}