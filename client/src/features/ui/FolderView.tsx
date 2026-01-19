import { FolderOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useTranslations } from 'use-intl';

interface YearFolder {
  year: number;
  count: number;
}

interface CompanyFolder {
  companyName: string;
  count: number;
}

interface YearFolderViewProps {
  years: YearFolder[];
  isLoading: boolean;
  onFolderOpen: (year: number) => void;
}

interface CompanyFolderViewProps {
  companies: CompanyFolder[];
  isLoading: boolean;
  onFolderOpen: (companyName: string) => void;
}

export function YearFolderView({ years, isLoading, onFolderOpen }: YearFolderViewProps) {
  const t = useTranslations('DocumentsPage');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FolderOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
        <p className="mt-4">{t('table.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {years.map((folder) => (
        <div
          key={folder.year}
          onDoubleClick={() => onFolderOpen(folder.year)}
          className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group"
        >
          <div className="relative">
            <FolderOutlined
              style={{ fontSize: 64, color: '#f59e0b' }}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              {folder.count}
            </span>
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
            {folder.year}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CompanyFolderView({ companies, isLoading, onFolderOpen }: CompanyFolderViewProps) {
  const t = useTranslations('DocumentsPage');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <FolderOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
        <p className="mt-4">{t('table.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {companies.map((folder) => (
        <div
          key={folder.companyName}
          onDoubleClick={() => onFolderOpen(folder.companyName)}
          className="flex flex-col items-center p-4 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group"
        >
          <div className="relative">
            <FolderOutlined
              style={{ fontSize: 64, color: '#3b82f6' }}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {folder.count}
            </span>
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center max-w-[120px] truncate" title={folder.companyName}>
            {folder.companyName}
          </span>
        </div>
      ))}
    </div>
  );
}

interface FolderBreadcrumbProps {
  currentYear: number | null;
  currentCompany: string | null;
  onBackToRoot: () => void;
  onBackToYear: () => void;
}

export function FolderBreadcrumb({ currentYear, currentCompany, onBackToRoot, onBackToYear }: FolderBreadcrumbProps) {
  const t = useTranslations('DocumentsPage');

  const canGoBack = currentYear !== null;

  const handleBack = () => {
    if (currentCompany) {
      onBackToYear();
    } else if (currentYear) {
      onBackToRoot();
    }
  };

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

      <div className="flex items-center gap-2 text-sm">
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
              onClick={currentCompany ? onBackToYear : undefined}
              className={`flex items-center gap-1 ${currentCompany
                  ? 'text-blue-600 hover:underline cursor-pointer'
                  : 'text-gray-700 font-medium'
                }`}
            >
              <FolderOutlined style={{ color: '#f59e0b' }} />
              {currentYear}
            </span>
          </>
        )}

        {/* Company */}
        {currentCompany && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium flex items-center gap-1">
              <FolderOutlined style={{ color: '#3b82f6' }} />
              {currentCompany}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Backward compatibility - export old names as aliases
export const FolderView = YearFolderView;
