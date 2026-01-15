import { useNavigate } from "react-router-dom";
import { Card, List, Tag, Spin, Button, Empty } from "antd";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bildirişlər</h1>
        <p className="text-blue-100 text-sm">Bu gün sistemə əlavə edilən yeni sənədlər</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {data?.data && data.data.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
              dataSource={data.data}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    className="h-full shadow-sm hover:shadow-md transition-shadow border-gray-200"
                    actions={[
                      <Button type="link" onClick={() => navigate(`/dashboard/docs/${item.id}`)}>Bax</Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={getFileIcon(item.fileFormat)}
                      title={<span className="text-gray-800 font-semibold truncate block" title={item.id.toString()}>{item.companyName}</span>}
                      description={
                        <div className="space-y-2 mt-2">
                          <Tag color="blue">{item.documentType}</Tag>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <UserOutlined /> <span>{item.uploadedBy?.firstName} {item.uploadedBy?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ClockCircleOutlined /> <span>{formatTime(item.uploadedAt)}</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="Bu gün heç bir sənəd əlavə edilməyib" />
          )}
        </div>
      )}
    </div>
  );
}
