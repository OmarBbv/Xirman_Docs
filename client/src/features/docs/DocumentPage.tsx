import { Table } from "../ui/table";

export default function DocumentPage() {
  const data = [
    { id: 1, title: "Xirman Proyekti Detalları", author: "admin", date: "2024/01/09", status: "Dərc edilib" },
    { id: 2, title: "İllik Maliyyə Hesabatı", author: "omar", date: "2024/01/08", status: "Qaralama" },
    { id: 3, title: "İstifadəçi Təlimatları", author: "admin", date: "2024/01/07", status: "Dərc edilib" },
  ];


  return (
    <div className="space-y-4">
      {/* WP Title Section */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[23px] font-normal text-[#1d2327]">Sənədlər</h2>
        <button className="bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Yeni əlavə et
        </button>
      </div>

      {/* Filter Bar */}
      <ul className="flex items-center space-x-2 text-[13px] text-[#2271b1]">
        <li className="text-black font-semibold">Hamısı (12)</li>
        <span className="text-[#c3c4c7]">|</span>
        <li className="cursor-pointer hover:text-[#135e96]">Dərc olunanlar (10)</li>
        <span className="text-[#c3c4c7]">|</span>
        <li className="cursor-pointer hover:text-[#135e96]">Çöp qutusu (2)</li>
      </ul>

      {/* Bulk Actions & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <select className="border border-[#8c8f94] bg-white text-sm px-3 py-2 rounded-md focus:border-[#2271b1] focus:ring-0 outline-none min-w-[160px] cursor-pointer">
            <option>Toplu əməliyyatlar</option>
            <option>Sil</option>
            <option>Düzəliş et</option>
          </select>
          <button className="border border-[#8c8f94] bg-white text-[#2c3338] text-sm px-5 py-2 rounded-md hover:bg-[#f6f7f7] hover:border-[#2271b1] hover:text-[#2271b1] transition-all shadow-sm font-medium cursor-pointer">
            Tətbiq et
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Sənədlərdə axtar..."
            className="border border-[#8c8f94] bg-white text-sm px-4 py-2 rounded-md focus:border-[#2271b1] focus:ring-0 outline-none w-72 shadow-sm"
          />
          <button className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm px-6 py-2 rounded-md transition-all shadow-sm font-medium cursor-pointer">
            Axtar
          </button>
        </div>
      </div>

      {/* WP Table Component */}
      <Table data={data} />

      {/* Pagination Container */}
      <div className="flex items-center justify-between text-[13px] text-[#50575e] mt-2">
        <div>12 element</div>
        <div className="flex items-center gap-1.5">
          <button className="px-3 py-1.5 bg-[#f0f0f1] border border-[#c3c4c7] text-[#c3c4c7] rounded-md cursor-not-allowed">«</button>
          <button className="px-4 py-1.5 bg-[#2271b1] border border-[#2271b1] text-white rounded-md font-bold shadow-sm cursor-pointer">1</button>
          <button className="px-4 py-1.5 bg-white border border-[#c3c4c7] text-[#2271b1] hover:bg-[#f0f6fa] hover:border-[#2271b1] rounded-md transition-all shadow-sm cursor-pointer">2</button>
          <button className="px-3 py-1.5 bg-white border border-[#c3c4c7] text-[#2271b1] hover:bg-[#f0f6fa] hover:border-[#2271b1] rounded-md transition-all shadow-sm cursor-pointer">»</button>
        </div>
      </div>
    </div>
  )
}