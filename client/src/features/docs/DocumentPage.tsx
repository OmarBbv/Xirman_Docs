import { Table } from "../ui/table";

export default function DocumentPage() {
  const data = [
    { id: 1, title: "Xirman Proyekti Detalları", author: "admin", date: "2024/01/09", status: "Dərc edilib" },
    { id: 2, title: "İllik Maliyyə Hesabatı", author: "omar", date: "2024/01/08", status: "Qaralama" },
    { id: 3, title: "İstifadəçi Təlimatları", author: "admin", date: "2024/01/07", status: "Dərc edilib" },
  ];

  const stats = [
    {
      label: "Toplam Sənəd",
      value: "128",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Dərc edilib",
      value: "95",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgLight: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Qaralama",
      value: "28",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      bgLight: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      label: "Çöp qutusu",
      value: "5",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      bgLight: "bg-red-50",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Sənəd İdarəetməsi</h1>
            <p className="text-blue-100 text-sm">Bütün sənədlərinizi buradan idarə edə bilərsiniz</p>
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
              Yeni Sənəd
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
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
            Hamısı (12)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2271b1] hover:bg-blue-50 rounded-lg transition-all">
            Dərc olunanlar (10)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#2271b1] hover:bg-blue-50 rounded-lg transition-all">
            Qaralama (2)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            Çöp qutusu (0)
          </button>
        </div>

        {/* Actions & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select className="border border-gray-300 bg-white text-sm px-4 py-2.5 rounded-lg focus:border-[#2271b1] focus:ring-2 focus:ring-blue-100 outline-none min-w-[180px] transition-all">
              <option>Toplu əməliyyatlar</option>
              <option>Sil</option>
              <option>Düzəliş et</option>
              <option>Çöp qutusuna göndər</option>
            </select>
            <button className="border border-gray-300 bg-white text-gray-700 text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:border-[#2271b1] hover:text-[#2271b1] transition-all font-medium">
              Tətbiq et
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Sənədlərdə axtar..."
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
        <Table data={data} />

        {/* Pagination - Modern Design */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">12</span> sənəd tapıldı
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
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-[#2271b1] hover:text-[#2271b1] rounded-lg transition-all">
              3
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