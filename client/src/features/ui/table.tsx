interface TableProps {
  data: {
    id: number;
    title: string;
    author: string;
    date: string;
    status: string;
  }[];
  actions?: string[]
}

export const Table = ({ data, actions }: TableProps) => {
  return (
    <div className="border border-[#c3c4c7] bg-white overflow-x-auto">
      <table className="w-full text-left text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-[#c3c4c7] bg-white">
            <th className="p-2 w-10 text-center">
              <input type="checkbox" className="border-[#8c8f94] cursor-pointer" />
            </th>
            <th className="p-2 font-bold text-[#1d2327]">Başlıq</th>
            <th className="p-2 font-bold text-[#1d2327]">Müəllif</th>
            <th className="p-2 font-bold text-[#1d2327]">Tarix</th>
            <th className="p-2 font-bold text-[#1d2327]">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group transition-colors"
            >
              <td className="p-2 text-center align-top">
                <input type="checkbox" className="border-[#8c8f94] cursor-pointer" />
              </td>
              <td className="p-2 align-top">
                <div className="font-bold text-[#2271b1] hover:text-[#135e96] cursor-pointer text-sm font-sans">
                  {item.title}
                </div>
                {/* Action Links - Visible on Hover */}
                <div className="flex items-center space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                  {actions?.map((action) => (
                    <span key={action} className="text-[#2271b1] cursor-pointer hover:text-[#135e96]">{action}</span>
                  ))}
                  <span className="text-[#c3c4c7]">|</span>
                  <span className="text-[#2271b1] cursor-pointer hover:text-[#135e96]">Bax</span>
                </div>
              </td>
              <td className="p-2 align-top text-[#2271b1]">{item.author}</td>
              <td className="p-2 align-top text-[#50575e]">
                Dərc edilib<br />
                <span className="text-[12px]">{item.date}</span>
              </td>
              <td className="p-2 align-top">
                <span
                  className={`px-2 py-0.5 rounded-sm text-[11px] font-medium ${item.status === "Dərc edilib"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        {/* <tfoot>
          <tr className="bg-white">
            <th className="p-2 text-center">
              <input type="checkbox" className="border-[#8c8f94] cursor-pointer" />
            </th>
            <th className="p-2 font-bold">Başlıq</th>
            <th className="p-2 font-bold">Müəllif</th>
            <th className="p-2 font-bold">Tarix</th>
            <th className="p-2 font-bold">Status</th>
          </tr>
        </tfoot> */}
      </table>
    </div>
  );
};
