import { useNavigate } from "react-router-dom";
import { Spin, Empty } from "antd";
import { useDocuments } from "../hooks/documentHooks";
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  ClockCircleOutlined,
  UserOutlined
} from "@ant-design/icons";

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Bu günün tarixini al (Local Time)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const { data, isLoading } = useDocuments({
    page: 1,
    limit: 50,
    startDate: dateString,
  });

  const getFileIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'pdf': return <FilePdfOutlined className="text-red-500 text-2xl" />;
      case 'excel':
      case 'xlsx':
      case 'xls': return <FileExcelOutlined className="text-green-500 text-2xl" />;
      case 'word':
      case 'docx':
      case 'doc': return <FileWordOutlined className="text-blue-500 text-2xl" />;
      default: return <FileTextOutlined className="text-gray-500 text-2xl" />;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("az-AZ", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg md:shadow-lg p-5 md:p-8 text-white">
        <h1 className="text-xl md:text-3xl font-bold mb-2">Bildirişlər</h1>
        <p className="text-blue-100 text-xs md:text-sm">Bu gün sistemə əlavə edilən yeni sənədlər</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-transparent md:bg-white rounded-lg md:shadow-sm md:border border-gray-200 p-0 md:p-6">
          {data?.data && data.data.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.data.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => navigate(`/dashboard/docs/${item.id}`)}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div className="shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      {getFileIcon(item.fileFormat)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate pr-4">{item.companyName}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                              {item.documentType}
                            </span>
                            <div className="flex items-center gap-1">
                              <UserOutlined />
                              <span>{item.uploadedBy?.firstName} {item.uploadedBy?.lastName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockCircleOutlined />
                              <span>{formatTime(item.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center text-[#2271b1] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Sənədə bax →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Bu gün heç bir sənəd əlavə edilməyib" />
          )}
        </div>
      )}
    </div>
  );
}
