import { useNavigate } from "react-router-dom";
import { Spin, Empty } from "antd";
import { useDocuments } from "../hooks/documentHooks";
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckOutlined
} from "@ant-design/icons";
import { useMarkAsRead } from "../hooks/documentHooks";
import { useTranslations, useLocale } from "use-intl";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const t = useTranslations('NotificationsPage');
  const locale = useLocale();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;

  const { data, isLoading } = useDocuments({
    page: 1,
    limit: 50,
    startDate: dateString,
    excludeRead: true,
  });

  const markAsReadMutation = useMarkAsRead();

  const handleCardClick = (id: number) => {
    markAsReadMutation.mutate(id);
    navigate(`/dashboard/docs/${id}`);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

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
    return new Date(dateStr).toLocaleTimeString(locale === 'az' ? 'az-AZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg md:shadow-lg p-5 md:p-8 text-white">
        <h1 className="text-xl md:text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-blue-100 text-xs md:text-sm">{t('subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {data?.data && data.data.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.data.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group cursor-pointer relative"
                  onClick={() => handleCardClick(item.id)}
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

                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors z-10"
                            title={t('markRead')}
                            onClick={(e) => handleMarkAsRead(e, item.id)}
                          >
                            <CheckOutlined />
                          </div>
                          <div className="hidden md:flex items-center text-[#2271b1] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {t('viewDoc')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description={t('empty')} />
          )}
        </>
      )}
    </div>
  );
}
