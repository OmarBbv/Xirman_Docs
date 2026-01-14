import { Table, Tag, Space, Button, Tooltip, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined
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
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Bax">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record.id)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Yüklə">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(record.id, record.fileName);
              }}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Sənədi sil"
              description="Bu sənədi silmək istədiyinizə əminsiniz?"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete?.(record.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Bəli"
              cancelText="Xeyr"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
  );
};
