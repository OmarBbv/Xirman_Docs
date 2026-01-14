import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, DetailIcon, ExternalLinkIcon, EyeIcon } from "../ui/Icons";
import { useDocument, useDocumentViews, useDownloadDocument, useUpdateDocument, useDocumentVersions, useDownloadVersion } from "../hooks/documentHooks";
import { Spin, Alert, Tag, Avatar, Button as AntButton } from "antd";
import { useDebounce } from "../hooks/useDebounce";
import { UploadOutlined, HistoryOutlined, FileTextOutlined, DownOutlined, RightOutlined, DownloadOutlined } from "@ant-design/icons";

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);
  const [viewSearch, setViewSearch] = useState("");
  const debouncedSearch = useDebounce(viewSearch, 500);
  const [showHistory, setShowHistory] = useState(false);

  const { data: document, isLoading: isDocLoading, error: docError } = useDocument(documentId);
  const { data: views, isLoading: isViewsLoading } = useDocumentViews(documentId, debouncedSearch);
  const { data: versions } = useDocumentVersions(documentId);

  const downloadDocument = useDownloadDocument();
  const updateDocument = useUpdateDocument();
  const downloadVersion = useDownloadVersion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDocument.mutate({ id: documentId, data: {}, file });
    }
  };

  const handleVersionDownload = (ver: any) => {
    // e.stopPropagation() lazım ola bilər əgər iç-içə elementlər varsa, amma burada lazım deyil
    downloadVersion.mutate({ id: ver.id, fileName: ver.fileName });
  };

  if (isDocLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div className="p-8">
        <Alert
          message="Xəta"
          description="Sənəd tapılmadı və ya yüklənərkən xəta baş verdi."
          type="error"
          showIcon
          action={
            <button
              onClick={() => navigate('/dashboard/docs')}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Geri qayıt
            </button>
          }
        />
      </div>
    );
  }

  const handleDownload = () => {
    downloadDocument.mutate({ id: documentId, fileName: document.fileName });
  };

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/dashboard/docs')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                title="Geri qayıt"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold">{document.companyName}</h1>
            </div>
            <p className="text-blue-100 text-sm ml-12">
              Sənəd № {document.id} • {new Date(document.documentDate).toLocaleDateString('az-AZ')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tag color="green" className="px-3 py-1 text-sm font-medium border-0">
              Aktiv
            </Tag>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Main Details */}
        <div className="flex-1 flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DetailIcon className="w-5 h-5 text-[#2271b1]" />
              Sənəd Məlumatları
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Yüklənib</p>
                <p className="font-semibold text-gray-900">
                  {new Date(document.uploadedAt).toLocaleString('az-AZ')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Məbləğ</p>
                <p className="font-semibold text-gray-900">
                  {document.amount ? `${document.amount} AZN` : '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Sənəd növü</p>
                <p className="font-semibold text-gray-900">
                  {getDocumentTypeLabel(document.documentType)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Sənəd formatı</p>
                <p className="font-semibold text-gray-900 uppercase">
                  {document.fileFormat}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Yükləyən istifadəçi</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar style={{ backgroundColor: '#2271b1' }} size="small">
                    {document.uploadedBy?.firstName?.[0] || 'U'}
                  </Avatar>
                  <p className="font-semibold text-gray-900">
                    {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Sənəd Faylı</h3>
              <div
                onClick={handleDownload}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <DetailIcon className="w-8 h-8 text-[#2271b1]" />
                  <div>
                    <p className="font-medium text-[#2271b1] group-hover:text-[#135e96] break-all">
                      {document.fileName}
                    </p>
                    <p className="text-xs text-blue-600">
                      Ölçü: {formatFileSize(document.fileSize)} • Yükləmək üçün klikləyin
                    </p>
                  </div>
                </div>
                <ExternalLinkIcon className="w-5 h-5 text-blue-400 group-hover:text-blue-600 shrink-0" />
              </div>

              {/* Faylın Yenilənməsi Bölməsi */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500">
                  {document.updatedBy ? (
                    <div className="flex items-center gap-2">
                      <Avatar size="small" style={{ backgroundColor: '#fa8c16' }}>
                        {document.updatedBy.firstName?.[0]}
                      </Avatar>
                      <span>
                        Son düzəliş: <b>{document.updatedBy.firstName} {document.updatedBy.lastName}</b>
                        <span className="text-gray-400 ml-1">
                          ({new Date(document.updatedAt).toLocaleString('az-AZ')})
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span>Bu sənəddə hələ düzəliş edilməyib</span>
                  )}
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <AntButton
                    icon={<UploadOutlined />}
                    size="small"
                    loading={updateDocument.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    type="default"
                    className="text-xs"
                  >
                    Yeni Versiya Yüklə
                  </AntButton>
                </div>
              </div>

              {/* Versiya Tarixçəsi */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#2271b1] transition-colors w-full cursor-pointer"
                >
                  {showHistory ? <DownOutlined className="text-xs" /> : <RightOutlined className="text-xs" />}
                  <HistoryOutlined />
                  Versiya Tarixçəsi ({versions?.length || 0})
                </button>

                {showHistory && versions && versions.length > 0 && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {versions.map((ver) => (
                      <div
                        key={ver.id}
                        onClick={() => handleVersionDownload(ver)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group"
                        title="Yükləmək üçün klikləyin"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-blue-100 p-2 rounded text-[#2271b1] shrink-0">
                            <FileTextOutlined />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-700 truncate" title={ver.fileName}>Version {ver.version} - {ver.fileName}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(ver.createdAt).toLocaleString('az-AZ')} • {formatFileSize(ver.fileSize)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2 flex items-center gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-600">
                              {ver.createdBy?.firstName} {ver.createdBy?.lastName}
                            </p>
                          </div>
                          <DownloadOutlined className="text-[#2271b1] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Viewers Sidebar */}
        <div className="flex flex-col h-full w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-[#2271b1]" />
                Baxış Tarixçəsi
              </h2>
            </div>

            <div className="mb-4 shrink-0">
              <input
                type="text"
                placeholder="İstifadəçi axtar..."
                value={viewSearch}
                onChange={(e) => setViewSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#2271b1] transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            {isViewsLoading ? (
              <div className="flex justify-center p-4">
                <Spin />
              </div>
            ) : views && views.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                {views.map((view) => (
                  <div key={view.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        style={{ backgroundColor: '#f0f2f5', color: '#666' }}
                        size="small"
                        className="shrink-0"
                      >
                        {view.viewedBy?.firstName?.[0] || 'U'}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-700 text-sm truncate max-w-[140px]" title={`${view.viewedBy?.firstName} ${view.viewedBy?.lastName}`}>
                          {view.viewedBy?.firstName} {view.viewedBy?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]" title={view.viewedBy?.email}>
                          {view.viewedBy?.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2 shrink-0">
                      {new Date(view.viewedAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Hələ baxış yoxdur
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
