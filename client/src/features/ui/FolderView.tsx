import { FolderOutlined, ArrowLeftOutlined, HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useTranslations } from 'use-intl';

interface Folder {
  name: string;
  count: number;
  label?: string; // For translation lookups
  type: 'year' | 'department' | 'documentType';
}

interface GenericFolderViewProps {
  items: Folder[];
  isLoading: boolean;
  onFolderOpen: (name: string) => void;
  emptyMessage?: string;
  color?: string;
}

export function GenericFolderView({ items, isLoading, onFolderOpen, emptyMessage, color = '#3b82f6' }: GenericFolderViewProps) {
  const t = useTranslations('DocumentsPage');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FolderOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
        <p className="mt-4">{emptyMessage || t('table.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {items.map((folder) => (
        <div
          key={folder.name}
          onDoubleClick={() => onFolderOpen(folder.name)}
          className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group select-none"
        >
          <div className="relative">
            {folder.type === 'documentType' ? (
              <FileTextOutlined
                style={{ fontSize: 56, color: color }}
                className="group-hover:scale-110 transition-transform mb-2"
              />
            ) : (
              <FolderOutlined
                style={{ fontSize: 64, color: color }}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            <span className={`absolute ${folder.type === 'documentType' ? '-bottom-2' : '-bottom-1'} left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full`}>
              {folder.count}
            </span>
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center max-w-[120px] truncate" title={folder.label || folder.name}>
            {folder.label || folder.name}
          </span>
        </div>
      ))}
    </div>
  );
}

interface FolderBreadcrumbProps {
  currentYear: number | null;
  currentDepartment: string | null;
  currentType: string | null;
  onBackToRoot: () => void;
  onBackToYear: () => void;
  onBackToDepartment: () => void;
  t: any;
}

export function FolderBreadcrumb({
  currentYear,
  currentDepartment,
  currentType,
  onBackToRoot,
  onBackToYear,
  onBackToDepartment,
  t
}: FolderBreadcrumbProps) {

  const canGoBack = currentYear !== null;

  const handleBack = () => {
    if (currentType) {
      onBackToDepartment();
    } else if (currentDepartment) {
      onBackToYear();
    } else if (currentYear) {
      onBackToRoot();
    }
  };

  const departmentLabel = currentDepartment ? t(`departments.${currentDepartment}`) : currentDepartment;
  const typeLabel = currentType ? t(`types.${currentType}`) : currentType;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
      <button
        onClick={handleBack}
        disabled={!canGoBack}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${canGoBack
          ? 'text-blue-600 hover:bg-blue-100 cursor-pointer'
          : 'text-gray-400 cursor-not-allowed'
          }`}
      >
        <ArrowLeftOutlined />
        <span className="text-sm font-medium">{t('table.back')}</span>
      </button>

      <div className="flex items-center gap-2 text-sm flex-wrap">
        {/* Root */}
        <span
          onClick={onBackToRoot}
          className={`flex items-center gap-1 ${currentYear ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-700 font-medium'}`}
        >
          <HomeOutlined />
          {t('title')}
        </span>

        {/* Year */}
        {currentYear && (
          <>
            <span className="text-gray-400">/</span>
            <span
              onClick={currentDepartment ? onBackToYear : undefined}
              className={`flex items-center gap-1 ${currentDepartment
                ? 'text-blue-600 hover:underline cursor-pointer'
                : 'text-gray-700 font-medium'
                }`}
            >
              <FolderOutlined style={{ color: '#f59e0b' }} />
              {currentYear}
            </span>
          </>
        )}

        {/* Department */}
        {currentDepartment && (
          <>
            <span className="text-gray-400">/</span>
            <span
              onClick={currentType ? onBackToDepartment : undefined}
              className={`text-gray-700 font-medium flex items-center gap-1 ${currentType ? 'text-blue-600 hover:underline cursor-pointer' : ''}`}
            >
              <FolderOutlined style={{ color: '#3b82f6' }} />
              {departmentLabel}
            </span>
          </>
        )}

        {/* Document Type */}
        {currentType && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <FileTextOutlined style={{ color: '#10b981' }} />
              {typeLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
