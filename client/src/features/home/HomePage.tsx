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
      {/* Welcome Section - Modern Header */}
      <div className="bg-gradient-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Xoş gəldiniz, Admin</h1>
            <p className="text-blue-100 text-sm">Sistemin ümumi vəziyyəti və son hərəkətlər burada görüntülənir</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Sənəd axtar..."
                className="pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white placeholder-blue-200 focus:bg-white/20 focus:border-white/40 outline-none transition-all w-64"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="bg-white text-[#2271b1] px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Sənəd
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Toplam Sənəd",
            value: "1,284",
            trend: "+12%",
            trendLabel: "bu ay",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            gradient: "from-blue-500 to-blue-600",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600"
          },
          {
            label: "Toplam Məbləğ",
            value: "42,500 ₼",
            trend: "+5%",
            trendLabel: "keçən ay",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: "from-emerald-500 to-emerald-600",
            bgLight: "bg-emerald-50",
            textColor: "text-emerald-600"
          },
          {
            label: "Aktiv İstifadəçilər",
            value: "18",
            trend: "+3",
            trendLabel: "son 24 saat",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            gradient: "from-purple-500 to-purple-600",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600"
          },
          {
            label: "Gözləyən Tapşırıqlar",
            value: "5",
            trend: "3",
            trendLabel: "təcili",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: "from-amber-500 to-amber-600",
            bgLight: "bg-amber-50",
            textColor: "text-amber-600"
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md hover:border-gray-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded ${stat.bgLight} ${stat.textColor}`}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{stat.trendLabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Document Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Sənəd Növü Dağılımı</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Detallar
            </button>
          </div>
          <div className="space-y-5">
            {[
              { label: "PDF Sənədlər", value: 65, count: "834", color: "bg-[#2271b1]", lightColor: "bg-blue-100" },
              { label: "Excel (XLSX)", value: 45, count: "578", color: "bg-[#34A853]", lightColor: "bg-green-100" },
              { label: "Word (DOCX)", value: 30, count: "385", color: "bg-[#FBBC05]", lightColor: "bg-yellow-100" },
              { label: "Digər", value: 15, count: "193", color: "bg-[#EA4335]", lightColor: "bg-red-100" },
            ].map((bar, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{bar.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{bar.count} sənəd</span>
                    <span className="font-bold text-gray-900">{bar.value}%</span>
                  </div>
                </div>
                <div className={`h-3 w-full ${bar.lightColor} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${bar.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Distribution - Enhanced */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Şirkətlərə Görə Dağılım</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Detallar
            </button>
          </div>
          <div className="flex items-center justify-center gap-8">
            {/* Enhanced Pie Chart */}
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#e5e7eb" strokeWidth="32" />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#2271b1" strokeWidth="32" strokeDasharray="377" strokeDashoffset="75" className="transition-all duration-1000" />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#34A853" strokeWidth="32" strokeDasharray="377" strokeDashoffset="264" className="transition-all duration-1000" />
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#FBBC05" strokeWidth="32" strokeDasharray="377" strokeDashoffset="339" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-xs text-gray-500">Toplam</p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-3">
              {[
                { label: "Şirkət A", value: "70%", count: "899", color: "bg-[#2271b1]" },
                { label: "Şirkət B", value: "20%", count: "257", color: "bg-[#34A853]" },
                { label: "Şirkət C", value: "10%", count: "128", color: "bg-[#FBBC05]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 ${item.color} rounded`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.count} sənəd</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Table & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Documents Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Son Yüklənən Sənədlər</h3>
            <button className="text-sm text-[#2271b1] font-semibold hover:text-[#135e96]">
              Hamısına bax →
            </button>
          </div>
          <Table data={recentDocs} />
        </div>

        {/* Activity Timeline - Enhanced */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Son Hərəkətlər</h3>
          <div className="relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200"></div>
            <div className="space-y-5 relative">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start relative">
                  <div className={`w-6 h-6 rounded-full ${act.color} ring-4 ring-white z-10 shrink-0 flex items-center justify-center shadow-sm`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{act.user}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{act.action}</p>
                    <span className="text-xs text-gray-400 mt-1 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-4 pt-4 border-t border-gray-200 text-sm text-[#2271b1] font-semibold text-center hover:text-[#135e96]">
            Bütün hərəkətlərə bax
          </button>
        </div>
      </div>
    </div>
  );
}