import { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Tabs } from 'antd';
import { FileIcon } from './Icons';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import { documentService } from '../services/documentServices';
import type { Document, FileFormat } from '../types/document.types';

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

type PreviewContent = {
  type: 'pdf' | 'word' | 'excel' | 'unsupported';
  content: string | ArrayBuffer | null;
  sheets?: { name: string; data: string[][] }[];
};

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const [preview, setPreview] = useState<PreviewContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState('0');
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!document || !isOpen) {
      setPreview(null);
      setFileBlob(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoading(true);

      try {
        const blob = await documentService.download(document.id);
        setFileBlob(blob);

        const extension = document.fileName.split('.').pop()?.toLowerCase();

        if (extension === 'pdf') {
          const url = URL.createObjectURL(blob);
          setPreview({ type: 'pdf', content: url });
        } else if (extension === 'docx') {
          setPreview({ type: 'word', content: 'docx-preview' });
        } else if (extension === 'doc') {
          setPreview({
            type: 'unsupported',
            content: null
          });
        } else if (extension === 'xlsx' || extension === 'xls') {
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          const sheets = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
            return {
              name: sheetName,
              data: jsonData as string[][],
            };
          });

          setPreview({ type: 'excel', content: null, sheets });
          setActiveSheet('0');
        } else {
          setPreview({ type: 'unsupported', content: null });
        }
      } catch (error) {
        console.error('Preview error:', error);
        setPreview({ type: 'unsupported', content: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (preview?.type === 'pdf' && typeof preview.content === 'string') {
        URL.revokeObjectURL(preview.content);
      }
    };
  }, [document, isOpen]);

  // Render docx when container is ready
  useEffect(() => {
    if (preview?.type === 'word' && preview.content === 'docx-preview' && docxContainerRef.current && fileBlob) {
      const renderDocx = async () => {
        try {
          const arrayBuffer = await fileBlob.arrayBuffer();
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = '';
            await renderAsync(arrayBuffer, docxContainerRef.current, undefined, {
              className: 'docx-wrapper',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              useBase64URL: true,
              renderHeaders: true,
              renderFooters: true,
              renderFootnotes: true,
              renderEndnotes: true,
            });
          }
        } catch (error) {
          console.error('DOCX render error:', error);
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = `
              <div style="text-align: center; padding: 60px 20px;">
                <p style="color: #d93025; font-size: 16px; margin-bottom: 8px;">Sənədi oxumaq mümkün olmadı</p>
                <p style="color: #5f6368;">Fayl zədələnmiş ola bilər.</p>
              </div>
            `;
          }
        }
      };
      renderDocx();
    }
  }, [preview, fileBlob]);

  const getFileTypeLabel = (format: FileFormat) => {
    switch (format) {
      case 'pdf': return 'PDF Sənəd';
      case 'word': return 'Word Sənəd';
      case 'excel': return 'Excel Cədvəl';
      default: return 'Fayl';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeColor = (format: FileFormat) => {
    switch (format) {
      case 'pdf': return '#ea4335';
      case 'word': return '#4285f4';
      case 'excel': return '#34a853';
      default: return '#5f6368';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-[60vh] flex items-center justify-center">
          <Spin size="large" tip="Yüklənir..." />
        </div>
      );
    }

    if (preview?.type === 'pdf') {
      return (
        <iframe
          src={preview.content as string}
          className="w-full h-[65vh] border-0 rounded-lg"
          title="PDF Preview"
        />
      );
    }

    if (preview?.type === 'word') {
      return (
        <div
          ref={docxContainerRef}
          className="h-[65vh] overflow-auto bg-gray-100 rounded-lg docx-preview-container"
          style={{
            padding: '20px',
          }}
        />
      );
    }

    if (preview?.type === 'excel' && preview.sheets) {
      const tabItems = preview.sheets.map((sheet, index) => ({
        key: String(index),
        label: sheet.name,
        children: (
          <div className="h-[58vh] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {sheet.data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex === 0 ? 'bg-[#1a73e8] text-white sticky top-0' : 'hover:bg-gray-50'}
                  >
                    {row.map((cell, cellIndex) => {
                      const CellTag = rowIndex === 0 ? 'th' : 'td';
                      return (
                        <CellTag
                          key={cellIndex}
                          className={`border border-gray-200 px-3 py-2 text-left whitespace-nowrap ${rowIndex === 0 ? 'font-semibold border-[#1a73e8]' : ''
                            }`}
                        >
                          {cell !== undefined && cell !== null ? String(cell) : ''}
                        </CellTag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      }));

      return (
        <Tabs
          activeKey={activeSheet}
          onChange={setActiveSheet}
          items={tabItems}
          type="card"
        />
      );
    }

    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileIcon className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Bu fayl tipi önizləmə üçün dəstəklənmir</p>
          <p className="text-gray-400 text-sm mt-1">PDF, DOCX, XLSX faylları önizlənə bilər</p>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e8f0fe] flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={getFileTypeColor(document?.fileFormat || 'pdf')}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z" />
            </svg>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900 truncate max-w-[400px]">
              {document?.fileName || 'Fayl önizləməsi'}
            </div>
            <div className="text-xs text-gray-500">
              {document && `${formatFileSize(document.fileSize)} • ${getFileTypeLabel(document.fileFormat)}`}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={1000}
      centered
      destroyOnClose
      styles={{
        body: { padding: '16px 24px 24px' },
      }}
    >
      {renderContent()}
    </Modal>
  );
}
