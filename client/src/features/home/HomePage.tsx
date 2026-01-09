import { Table } from "../ui/table";

export default function HomePage() {
  const recentDocs = [
    { id: 1, title: "Müqavilə_32.pdf", author: "Elvin Hüseynli", date: "10 dk əvvəl", status: "Dərc edilib" },
    { id: 2, title: "Təchizat_Siyahısı.xlsx", author: "Admin", date: "1 saat əvvəl", status: "Qaralama" },
    { id: 3, title: "İllik_Hesabat_2023.docx", author: "Omar", date: "3 saat əvvəl", status: "Dərc edilib" },
  ];

  const activities = [
    { id: 1, user: "Elvin Hüseynli", action: "'Müqavilə_32.pdf' belgesine baxdı", time: "10 dk əvvəl", color: "bg-blue-500" },
    { id: 2, user: "Admin", action: "Yeni istifadəçi əlavə etdi (Leyla M.)", time: "25 dk əvvəl", color: "bg-green-500" },
    { id: 3, user: "Omar", action: "'İllik_Hesabat' silindi", time: "1 saat əvvəl", color: "bg-red-500" },
    { id: 4, user: "Admin", action: "Sistem parametrlərini güncəllədi", time: "2 saat əvvəl", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#c3c4c7] shadow-sm rounded-sm">
        <div>
          <h1 className="text-2xl font-normal text-[#1d2327]">Xoş gəldiniz, <span className="font-bold">Admin</span></h1>
          <p className="text-sm text-[#50575e] mt-1">Sistemin ümumi vəziyyəti və son hərəkətlər aşağıdadır.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Sürətli axtarış..."
              className="pl-10 pr-4 py-2 bg-[#f0f0f1] border border-[#8c8f94] rounded-md text-sm focus:bg-white focus:border-[#2271b1] outline-none transition-all w-64"
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-[#50575e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Sənəd Yüklə
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Sənəd", value: "1,284", trend: "+12% bu ay", icon: "📄", color: "text-blue-600" },
          { label: "Toplam Məbləğ", value: "42,500 ₼", trend: "+5% keçən aya görə", icon: "💰", color: "text-green-600" },
          { label: "Aktiv İstifadəçilər", value: "18", trend: "Son 24 saatda", icon: "👥", color: "text-purple-600" },
          { label: "Gözləyən Tapşırıqlar", value: "5", trend: "3 təcili", icon: "⏳", color: "text-orange-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 border border-[#c3c4c7] shadow-sm rounded-sm hover:border-[#2271b1] transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] text-[#50575e] font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-[#1d2327] mt-1">{stat.value}</h3>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-[11px] mt-3 font-semibold ${stat.color}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document Type Distribution (Bar Chart UI) */}
        <div className="bg-white p-6 border border-[#c3c4c7] shadow-sm rounded-sm">
          <h3 className="text-[16px] font-bold text-[#1d2327] mb-6">Sənəd Növü Dağılımı</h3>
          <div className="space-y-4">
            {[
              { label: "PDF Sənədlər", value: 65, color: "bg-[#2271b1]" },
              { label: "Excel (XLSX)", value: 45, color: "bg-[#34A853]" },
              { label: "Word (DOCX)", value: 30, color: "bg-[#FBBC05]" },
              { label: "Digər", value: 15, color: "bg-[#EA4335]" },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{bar.label}</span>
                  <span>{bar.value}%</span>
                </div>
                <div className="h-2 w-full bg-[#f0f0f1] rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} transition-all duration-1000`} style={{ width: `${bar.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Distribution (Pie Chart Style UI) */}
        <div className="bg-white p-6 border border-[#c3c4c7] shadow-sm rounded-sm">
          <h3 className="text-[16px] font-bold text-[#1d2327] mb-6">Şirkətlərə Göre Dağılım</h3>
          <div className="flex items-center justify-around h-40">
            {/* Simple SVG Pie Chart */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="50" fill="transparent" stroke="#2271b1" strokeWidth="28" strokeDasharray="314" strokeDashoffset="60" />
              <circle cx="64" cy="64" r="50" fill="transparent" stroke="#34A853" strokeWidth="28" strokeDasharray="314" strokeDashoffset="260" />
              <circle cx="64" cy="64" r="50" fill="transparent" stroke="#FBBC05" strokeWidth="28" strokeDasharray="314" strokeDashoffset="300" />
            </svg>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#50575e]">
                <div className="w-3 h-3 bg-[#2271b1] rounded-sm"></div> <span>Şirkət A (70%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#50575e]">
                <div className="w-3 h-3 bg-[#34A853] rounded-sm"></div> <span>Şirkət B (20%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#50575e]">
                <div className="w-3 h-3 bg-[#FBBC05] rounded-sm"></div> <span>Şirkət C (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Table & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Documents Table (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#1d2327]">Son Yüklənən Sənədlər</h3>
            <button className="text-[#2271b1] text-xs font-semibold hover:underline">Hamısına bax</button>
          </div>
          <Table data={recentDocs} />
        </div>

        {/* Activity Timeline (Takes 1 column) */}
        <div className="space-y-3">
          <h3 className="text-[16px] font-bold text-[#1d2327]">Son Hərəkətlər</h3>
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-4 relative overflow-hidden">
            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gray-200"></div>
            <div className="space-y-6 relative">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start relative">
                  <div className={`w-5 h-5 rounded-full ${act.color} ring-4 ring-white z-10 shrink-0 flex items-center justify-center`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#1d2327]">
                      <span className="font-bold">{act.user}</span>, {act.action}
                    </p>
                    <span className="text-[11px] text-[#50575e] mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}