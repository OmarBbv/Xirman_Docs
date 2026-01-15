import { Table, Tag, Space, Button, Dropdown, Modal, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { Document, FileFormat } from "../types/document.types";

interface DocumentTableProps {
  data: Document[];
  loading?: boolean;
  onView?: (id: number) => void;
  onDownload?: (id: number, fileName: string) => void;
  onDelete?: (id: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

// Fayl formatı üçün ikon
const getFileIcon = (format: FileFormat) => {
  const style = { fontSize: '20px' };
  switch (format) {
    case 'pdf':
      return <FilePdfOutlined style={{ ...style, color: '#ff4d4f' }} />;
    case 'word':
      return <FileWordOutlined style={{ ...style, color: '#1890ff' }} />;
    case 'excel':
      return <FileExcelOutlined style={{ ...style, color: '#52c41a' }} />;
    default:
      return <FileOutlined style={{ ...style, color: '#8c8c8c' }} />;
  }
};

// Sənəd növü Azərbaycan dilində
const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    contract: "Müqavilə",
    invoice: "Faktura",
    act: "Akt",
    report: "Hesabat",
    letter: "Məktub",
    order: "Sifariş",
    other: "Digər",
  };
  return labels[type] || type;
};

// Sənəd növü üçün rəng
const getDocumentTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    contract: "blue",
    invoice: "geekblue",
    act: "purple",
    report: "cyan",
    letter: "magenta",
    order: "orange",
    other: "default",
  };
  return colors[type] || "default";
};

// Fayl ölçüsünü formatla
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const DocumentTable = ({
  data,
  loading,
  onView,
  onDownload,
  onDelete,
  pagination
}: DocumentTableProps) => {

  const columns: ColumnsType<Document> = [
    {
      title: 'Fayl',
      key: 'file',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.fileFormat)}
          <span className="font-medium text-gray-700">{record.fileName}</span>
        </Space>
      ),
    },
    {
      title: 'Şirkət',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text) => <span className="text-gray-700 font-medium">{text}</span>,
    },
    {
      title: 'Növ',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type) => (
        <Tag color={getDocumentTypeColor(type)} className="rounded-full px-2">
          {getDocumentTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `${amount} AZN` : '-',
    },
    {
      title: 'Tarix',
      dataIndex: 'documentDate',
      key: 'documentDate',
      render: (date) => new Date(date).toLocaleDateString('az-AZ'),
      sorter: (a, b) => new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime(),
    },
    {
      title: 'Yükləyən',
      key: 'uploadedBy',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span className="text-sm font-medium text-gray-700">
            {record.uploadedBy?.firstName} {record.uploadedBy?.lastName}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(record.uploadedAt).toLocaleString('az-AZ')}
          </span>
        </Space>
      ),
    },
    {
      title: 'Ölçü',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => <span className="text-xs text-gray-500">{formatFileSize(size)}</span>,
    },
    {
      title: 'Əməliyyatlar',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                label: 'Bax',
                icon: <EyeOutlined />,
                onClick: () => onView?.(record.id),
              },
              {
                key: 'download',
                label: 'Yüklə',
                icon: <DownloadOutlined />,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  onDownload?.(record.id, record.fileName);
                },
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Sənədi sil',
                    content: 'Bu sənədi silmək istədiyinizə əminsiniz?',
                    okText: 'Bəli',
                    cancelText: 'Xeyr',
                    okButtonProps: { danger: true },
                    onOk: () => onDelete?.(record.id),
                  });
                },
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px', transform: 'rotate(90deg)' }} />}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-500 hover:text-gray-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => onView?.(record.id),
            style: { cursor: 'pointer' },
          })}
          pagination={pagination ? {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: pagination.onChange,
            showSizeChanger: false,
            position: ['bottomRight'],
          } : false}
          locale={{
            emptyText: 'Heç bir sənəd tapılmadı'
          }}
          scroll={{ x: true }}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">Yüklənir...</div>
        ) : data.length > 0 ? (
          data.map((record) => (
            <Card key={record.id} className="shadow-none border border-gray-200" bodyStyle={{ padding: '16px' }} onClick={() => onView?.(record.id)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(record.fileFormat)}
                  <span className="font-medium text-base text-gray-900 truncate">{record.fileName}</span>
                </div>
                <Tag color={getDocumentTypeColor(record.documentType)} className="mr-0 rounded-full px-2 text-xs">
                  {getDocumentTypeLabel(record.documentType)}
                </Tag>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Şirkət:</span>
                  <span className="font-medium text-gray-800">{record.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Məbləğ:</span>
                  <span className="font-medium text-gray-800">{record.amount ? `${record.amount} AZN` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tarix:</span>
                  <span>{new Date(record.documentDate).toLocaleDateString('az-AZ')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                <div className="text-xs text-gray-400">
                  {formatFileSize(record.fileSize)}
                </div>
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    trigger={['click']}
                    menu={{
                      items: [
                        {
                          key: 'download',
                          label: 'Yüklə',
                          icon: <DownloadOutlined />,
                          onClick: (info) => {
                            info.domEvent.stopPropagation();
                            onDownload?.(record.id, record.fileName);
                          },
                        },
                        {
                          key: 'delete',
                          label: 'Sil',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: (info) => {
                            info.domEvent.stopPropagation();
                            Modal.confirm({
                              title: 'Sənədi sil',
                              content: 'Sənədi silmək istədiyinizə əminsiniz?',
                              okText: 'Bəli',
                              cancelText: 'Xeyr',
                              okButtonProps: { danger: true },
                              onOk: () => onDelete?.(record.id),
                            });
                          },
                        },
                      ],
                    }}
                  >
                    <Button
                      size="small"
                      icon={<MoreOutlined style={{ fontSize: '18px', transform: 'rotate(90deg)' }} />}
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 border-gray-200"
                    />
                  </Dropdown>
                </Space>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">Heç bir sənəd tapılmadı</div>
        )}

        {/* Mobile Pagination */}
        {pagination && pagination.total > pagination.pageSize && (
          <div className="flex justify-center pt-4">
            <Button
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              className="mr-2"
            >
              Geri
            </Button>
            <span className="flex items-center px-2 text-sm text-gray-600">
              Səhifə {pagination.current}
            </span>
            <Button
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              className="ml-2"
            >
              İrəli
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
