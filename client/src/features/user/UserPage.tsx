import { Table } from "../ui/table";

export default function UserPage() {
  const users = [
    { id: 1, title: "Elvin Hüseynli", author: "admin", date: "2024/01/09", status: "Dərc edilib" },
    { id: 2, title: "Leyla Məmmədova", author: "editor", date: "2024/01/08", status: "Dərc edilib" },
    { id: 3, title: "Omar Bəy", author: "author", date: "2024/01/07", status: "Qaralama" },
  ];

  const stats = [
    {
      label: "Toplam İstifadəçi",
      value: "48",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Admin",
      value: "8",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgLight: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      label: "Editor",
      value: "15",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      bgLight: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Müəllif",
      value: "25",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgLight: "bg-amber-50",
      textColor: "text-amber-600"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">İstifadəçi İdarəetməsi</h1>
            <p className="text-blue-100 text-sm">Sistemdəki bütün istifadəçiləri buradan idarə edin</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 hover:bg-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              İxrac et
            </button>
            <button className="bg-white text-[#2271b1] px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Yeni İstifadəçi
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - User Roles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300">
            <div className="flex items-center justify-between">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Filter Tabs - Modern Design */}
        <div className="flex items-center gap-1 mb-6 pb-4 border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded-lg transition-all">
            Hamısı (48)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
            Admin (8)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
            Editor (15)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
            Müəllif (25)
          </button>
        </div>

        {/* Actions & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 bg-white text-sm px-4 py-2.5 rounded-lg focus:border-[#2271b1] focus:ring-2 focus:ring-blue-100 outline-none min-w-[180px] transition-all">
              <option>Toplu əməliyyatlar</option>
              <option>Sil</option>
              <option>Rolu dəyişdir</option>
              <option>Aktiv et</option>
              <option>Deaktiv et</option>
            </select>
            <button className="border border-gray-300 bg-white text-gray-700 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:border-[#2271b1] hover:text-[#2271b1] transition-all font-medium">
              Tətbiq et
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="İstifadəçi axtar..."
                className="border border-gray-300 bg-white text-sm pl-10 pr-4 py-2.5 rounded-lg focus:border-[#2271b1] focus:ring-2 focus:ring-blue-100 outline-none w-full md:w-80 transition-all"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm px-6 py-2.5 rounded-lg transition-all font-semibold shadow-sm">
              Axtar
            </button>
          </div>
        </div>

        {/* Table */}
        <Table data={users} />

        {/* Pagination - Modern Design */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">3</span> istifadəçi tapıldı
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg cursor-not-allowed" disabled>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-4 py-2 bg-[#2271b1] border border-[#2271b1] text-white rounded-lg font-semibold shadow-sm">
              1
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-[#2271b1] hover:text-[#2271b1] rounded-lg transition-all">
              2
            </button>
            <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-[#2271b1] hover:text-[#2271b1] rounded-lg transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}