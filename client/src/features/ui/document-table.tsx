import { Table, Tag, Space, Button, Dropdown, Modal, Card, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileOutlined,
  MoreOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useTranslations } from "use-intl";
import { useAuth } from "../../context/AuthContext";
import type { Document, FileFormat } from "../types/document.types";

interface DocumentTableProps {
  data: Document[];
  loading?: boolean;
  onView?: (id: number) => void;
  onDownload?: (id: number, fileName: string) => void;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  // Selection props
  selectionMode?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

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
  onShare,
  pagination,
  selectionMode = false,
  selectedIds = [],
  onSelectionChange
}: DocumentTableProps) => {
  const t = useTranslations('DocumentsPage');
  const { user } = useAuth();

  const handleRowClick = (record: Document) => {
    if (selectionMode) {
      const isSelected = selectedIds.includes(record.id);
      if (isSelected) {
        onSelectionChange?.(selectedIds.filter(id => id !== record.id));
      } else {
        onSelectionChange?.([...selectedIds, record.id]);
      }
    } else {
      onView?.(record.id);
    }
  };

  const handleCheckboxChange = (id: number, checked: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const columns: ColumnsType<Document> = [
    ...(selectionMode ? [{
      title: '',
      key: 'select',
      width: 50,
      render: (_: unknown, record: Document) => (
        <Checkbox
          checked={selectedIds.includes(record.id)}
          onClick={(e) => handleCheckboxChange(record.id, !selectedIds.includes(record.id), e)}
        />
      ),
    }] : []),
    {
      title: t('table.file'),
      key: 'file',
      render: (_, record) => (
        <Space>
          {getFileIcon(record.fileFormat)}
          <span className="font-medium text-gray-700">{record.fileName}</span>
        </Space>
      ),
    },
    {
      title: t('table.company'),
      dataIndex: 'companyName',
      key: 'companyName',
      render: (text) => <span className="text-gray-700 font-medium">{text}</span>,
    },
    {
      title: t('table.type'),
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type) => (
        <Tag color={getDocumentTypeColor(type)} className="rounded-full px-2">
          {t(`types.${type}`)}
        </Tag>
      ),
    },
    {
      title: t('table.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount ? `${amount} AZN` : '-',
    },
    {
      title: t('table.date'),
      dataIndex: 'documentDate',
      key: 'documentDate',
      render: (date) => new Date(date).toLocaleDateString('az-AZ'),
      sorter: (a, b) => new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime(),
    },
    {
      title: t('table.uploadedBy'),
      key: 'uploadedBy',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
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
      title: t('table.size'),
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => <span className="text-xs text-gray-500">{formatFileSize(size)}</span>,
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                label: t('table.view'),
                icon: <EyeOutlined />,
                onClick: () => onView?.(record.id),
              },
              {
                key: 'download',
                label: t('table.download'),
                icon: <DownloadOutlined />,
                onClick: (e: any) => {
                  e.domEvent.stopPropagation();
                  onDownload?.(record.id, record.fileName);
                },
              },
              {
                key: 'share',
                label: t('table.share'),
                icon: <ShareAltOutlined />,
                onClick: (e: any) => {
                  e.domEvent.stopPropagation();
                  onShare?.(record.id);
                },
              },
              ...(user?.role === 'admin' ? [
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  label: t('table.delete'),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: (e: any) => {
                    e.domEvent.stopPropagation();
                    Modal.confirm({
                      title: t('table.deleteConfirmTitle'),
                      content: t('table.deleteConfirmContent'),
                      okText: t('table.yes'),
                      cancelText: t('table.no'),
                      okType: 'danger',
                      onOk: () => onDelete?.(record.id),
                    });
                  },
                }
              ] : []),
            ] as any,
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
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
            className: selectionMode && selectedIds.includes(record.id) ? 'bg-blue-50' : '',
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
            emptyText: t('table.notFound')
          }}
          scroll={{ x: true }}
        />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg">{t('table.loading')}</div>
        ) : data.length > 0 ? (
          data.map((record) => (
            <Card
              key={record.id}
              className={`shadow-none border ${selectionMode && selectedIds.includes(record.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              styles={{ body: { padding: '16px' } }}
              onClick={() => handleRowClick(record)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  {selectionMode && (
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(record.id, !selectedIds.includes(record.id), e);
                      }}
                    />
                  )}
                  {getFileIcon(record.fileFormat)}
                  <span className="font-medium text-base text-gray-900 truncate">{record.fileName}</span>
                </div>
                <Tag color={getDocumentTypeColor(record.documentType)} className="mr-0 rounded-full px-2 text-xs">
                  {t(`types.${record.documentType}`)}
                </Tag>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('table.company')}:</span>
                  <span className="font-medium text-gray-800">{record.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('table.amount')}:</span>
                  <span className="font-medium text-gray-800">{record.amount ? `${record.amount} AZN` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('table.date')}:</span>
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
                          label: t('table.download'),
                          icon: <DownloadOutlined />,
                          onClick: (info: any) => {
                            info.domEvent.stopPropagation();
                            onDownload?.(record.id, record.fileName);
                          },
                        },
                        {
                          key: 'share',
                          label: t('table.share'),
                          icon: <ShareAltOutlined />,
                          onClick: (info: any) => {
                            info.domEvent.stopPropagation();
                            onShare?.(record.id);
                          },
                        },
                        ...(user?.role === 'admin' ? [
                          {
                            key: 'delete',
                            label: t('table.delete'),
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: (info: any) => {
                              info.domEvent.stopPropagation();
                              Modal.confirm({
                                title: t('table.deleteConfirmTitle'),
                                content: t('table.deleteConfirmContent'),
                                okText: t('table.yes'),
                                cancelText: t('table.no'),
                                okType: 'danger',
                                onOk: () => onDelete?.(record.id),
                              });
                            },
                          }
                        ] : []),
                      ] as any,
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
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">{t('table.notFound')}</div>
        )}

        {/* Mobile Pagination */}
        {pagination && pagination.total > pagination.pageSize && (
          <div className="flex justify-center pt-4">
            <Button
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              className="mr-2"
            >
              {t('table.back')}
            </Button>
            <span className="flex items-center px-2 text-sm text-gray-600">
              {t('table.page')} {pagination.current}
            </span>
            <Button
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              className="ml-2"
            >
              {t('table.forward')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
