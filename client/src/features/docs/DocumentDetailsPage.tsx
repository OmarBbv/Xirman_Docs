import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, DetailIcon, EyeIcon, PdfIcon, WordIcon, ExcelIcon, FileIcon } from "../ui/Icons";
import { useDocument, useDocumentViews, useDownloadDocument, useUpdateDocument, useDocumentVersions, useDownloadVersion, useDownloadAttachment, useUpdateAttachment, useAddAttachment } from "../hooks/documentHooks";
import { Spin, Alert, Tag, Avatar, Button as AntButton } from "antd";
import { useDebounce } from "../hooks/useDebounce";
import { UploadOutlined, HistoryOutlined, FileTextOutlined, DownOutlined, RightOutlined, DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "use-intl";
import { documentService } from "../services/documentServices";
import { message } from "antd";
import { DocumentPreviewModal } from "../ui/DocumentPreviewModal";
import type { DocumentAttachment } from "../types/document.types";

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const documentId = Number(id);
  const [viewSearch, setViewSearch] = useState("");
  const debouncedSearch = useDebounce(viewSearch, 500);
  const [showHistory, setShowHistory] = useState(false);
  const t = useTranslations('DocumentDetailsPage');
  const tCommon = useTranslations('DocumentsPage');
  const locale = useLocale();

  const { data: document, isLoading: isDocLoading, error: docError } = useDocument(documentId);
  const { data: views, isLoading: isViewsLoading } = useDocumentViews(documentId, debouncedSearch);
  const { data: versions } = useDocumentVersions(documentId);

  const downloadDocument = useDownloadDocument();
  const updateDocument = useUpdateDocument();
  const downloadVersion = useDownloadVersion();
  const downloadAttachment = useDownloadAttachment();
  const updateAttachment = useUpdateAttachment();
  const addAttachment = useAddAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addAttachmentInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileType, setSelectedFileType] = useState<'main' | 'attachment' | null>(null);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<number | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'document' | 'attachment'>('document');
  const [previewAttachment, setPreviewAttachment] = useState<DocumentAttachment | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedFileType === 'main') {
        updateDocument.mutate({ id: documentId, data: {}, file });
      } else if (selectedFileType === 'attachment' && selectedAttachmentId) {
        updateAttachment.mutate({ id: selectedAttachmentId, file });
      }
      setSelectedFileType(null);
      setSelectedAttachmentId(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMainFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileType('main');
    setSelectedAttachmentId(null);
    fileInputRef.current?.click();
  };

  const handleAttachmentClick = (attachmentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFileType('attachment');
    setSelectedAttachmentId(attachmentId);
    fileInputRef.current?.click();
  };

  const handleAddAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addAttachment.mutate({ documentId, file });
    }
    if (addAttachmentInputRef.current) {
      addAttachmentInputRef.current.value = '';
    }
  };

  const handleVersionDownload = (ver: any) => {
    downloadVersion.mutate({ id: ver.id, fileName: ver.fileName });
  };

  const handleShare = async () => {
    if (!document) return;

    try {
      const response = await documentService.getShareLink(documentId);
      const { downloadUrl, document: doc } = response;

      const subject = encodeURIComponent(`Sənəd: ${doc.fileName}`);
      const body = encodeURIComponent(
        `Salam,\n\nSizinlə "${doc.fileName}" sənədini paylaşmaq istəyirəm.\n\nSənəd məlumatları:\n- Şirkət: ${doc.companyName}\n- Məbləğ: ${doc.amount ? doc.amount + ' AZN' : 'Göstərilməyib'}\n- Növ: ${doc.documentType}\n\nSənədi yükləmək üçün bu linkə klikləyin:\n${downloadUrl}\n\nXirman EAS`
      );

      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    } catch (error) {
      message.error('Link yaradılarkən xəta baş verdi');
    }
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
          message={t('error.title')}
          description={t('error.description')}
          type="error"
          showIcon
          action={
            <button
              onClick={() => navigate('/dashboard/docs')}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              {t('back')}
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
    return tCommon(`types.${type}`);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string, size: string = "w-5 h-5") => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <PdfIcon className={size} />;
      case 'doc':
      case 'docx':
        return <WordIcon className={size} />;
      case 'xls':
      case 'xlsx':
        return <ExcelIcon className={size} />;
      default:
        return <FileIcon className={size} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => {
                  const docYear = new Date(document.documentDate).getFullYear();
                  navigate(`/dashboard/docs/year/${docYear}/department/${encodeURIComponent(document.department || 'other_service')}/type/${encodeURIComponent((document.documentType || 'other').toString())}`);
                }}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                title={t('back')}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-bold">{document.companyName}</h1>
            </div>
            <p className="text-blue-100 text-sm ml-12">
              {t('document.number')} {document.id} • {new Date(document.documentDate).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'ru-RU')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tag color="green" className="px-3 py-1 text-sm font-medium border-0">
              {t('document.status')}
            </Tag>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 flex flex-col h-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DetailIcon className="w-5 h-5 text-[#2271b1]" />
              {t('title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('document.uploadDate')}</p>
                <p className="font-semibold text-gray-900">
                  {new Date(document.uploadedAt).toLocaleString(locale === 'az' ? 'az-AZ' : 'ru-RU')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('document.amount')}</p>
                <p className="font-semibold text-gray-900">
                  {document.amount ? `${document.amount} AZN` : '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('document.type')}</p>
                <p className="font-semibold text-gray-900">
                  {getDocumentTypeLabel(document.documentType)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('document.format')}</p>
                <p className="font-semibold text-gray-900 uppercase">
                  {document.fileFormat}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('document.uploader')}</p>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('file.title')}</h3>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                    onClick={() => {
                      setPreviewType('document');
                      setPreviewAttachment(null);
                      setPreviewOpen(true);
                    }}
                    title="Önizləmə üçün klikləyin"
                  >
                    {getFileIcon(document.fileName, "w-8 h-8")}
                    <div>
                      <p className="font-medium text-[#2271b1] break-all">
                        {document.fileName}
                      </p>
                      <p className="text-xs text-blue-600">
                        {t('file.size')}: {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewType('document');
                        setPreviewAttachment(null);
                        setPreviewOpen(true);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Önizləmə"
                    >
                      <EyeIcon className="w-5 h-5 text-[#2271b1]" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Yüklə"
                    >
                      <DownloadOutlined className="text-lg text-[#2271b1]" />
                    </button>
                    <button
                      onClick={handleMainFileClick}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Yeni versiya yüklə"
                    >
                      <UploadOutlined className="text-lg text-[#2271b1]" />
                    </button>
                  </div>
                </div>
              </div>

              {document.attachments && document.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileTextOutlined />
                    Əlavə Fayllar ({document.attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {document.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setPreviewType('attachment');
                            setPreviewAttachment(attachment);
                            setPreviewOpen(true);
                          }}
                          title="Önizləmə üçün klikləyin"
                        >
                          {getFileIcon(attachment.fileName, "w-6 h-6")}
                          <div>
                            <p className="font-medium text-gray-700 text-sm break-all">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(attachment.fileSize)} • {attachment.fileFormat.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewType('attachment');
                              setPreviewAttachment(attachment);
                              setPreviewOpen(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            title="Önizləmə"
                          >
                            <EyeIcon className="w-4 h-4 text-gray-500 hover:text-[#2271b1]" />
                          </button>
                          <button
                            onClick={() => downloadAttachment.mutate({ id: attachment.id, fileName: attachment.fileName })}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            title="Yüklə"
                          >
                            <DownloadOutlined className="text-gray-500 hover:text-[#2271b1]" />
                          </button>
                          <button
                            onClick={(e) => handleAttachmentClick(attachment.id, e)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            title="Yeni versiya yüklə"
                          >
                            <UploadOutlined className="text-gray-500 hover:text-[#2271b1]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500">
                  {document.updatedBy ? (
                    <div className="flex items-center gap-2">
                      <Avatar size="small" style={{ backgroundColor: '#fa8c16' }}>
                        {document.updatedBy.firstName?.[0]}
                      </Avatar>
                      <span>
                        {t('file.lastEdit')}: <b>{document.updatedBy.firstName} {document.updatedBy.lastName}</b>
                        <span className="text-gray-400 ml-1">
                          ({new Date(document.updatedAt).toLocaleString(locale === 'az' ? 'az-AZ' : 'ru-RU')})
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span>{t('file.noEdit')}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <input
                    type="file"
                    ref={addAttachmentInputRef}
                    className="hidden"
                    onChange={handleAddAttachmentUpload}
                  />
                  <AntButton
                    icon={<UploadOutlined />}
                    size="small"
                    loading={addAttachment.isPending}
                    onClick={() => addAttachmentInputRef.current?.click()}
                    type="default"
                    className="text-xs"
                  >
                    {t('file.uploadNew')}
                  </AntButton>

                  <AntButton
                    icon={<ShareAltOutlined />}
                    size="small"
                    onClick={handleShare}
                    type="default"
                    className="text-xs"
                  >
                    Paylaş
                  </AntButton>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#2271b1] transition-colors w-full cursor-pointer"
                >
                  {showHistory ? <DownOutlined className="text-xs" /> : <RightOutlined className="text-xs" />}
                  <HistoryOutlined />
                  {t('history.title')} ({versions?.length || 0})
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
                          <div className="bg-blue-100 p-2 rounded shrink-0">
                            {getFileIcon(ver.fileName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-700 truncate" title={ver.fileName}>{t('history.version')} {ver.version} - {ver.fileName}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(ver.createdAt).toLocaleString(locale === 'az' ? 'az-AZ' : 'ru-RU')} • {formatFileSize(ver.fileSize)}
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

        <div className="flex flex-col h-full w-full lg:w-[350px] shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-[#2271b1]" />
                {t('viewers.title')}
              </h2>
            </div>

            <div className="mb-4 shrink-0">
              <input
                type="text"
                placeholder={t('viewers.search')}
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
                      {new Date(view.viewedAt).toLocaleString(locale === 'az' ? 'az-AZ' : 'ru-RU', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                {t('viewers.empty')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewType === 'document' ? document : undefined}
        attachmentId={previewType === 'attachment' ? previewAttachment?.id : undefined}
        fileName={previewType === 'attachment' ? previewAttachment?.fileName : undefined}
      />
    </div>
  );
}
