import { useState } from 'react';
import { UploadIcon, FileIcon, XIcon, EyeIcon } from './Icons';
import { FilePreviewModal } from './FilePreviewModal';

interface Props {
  label: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  className?: string;
}

export const FileUpload = ({ label, accept = ".pdf,.doc,.docx,.xls,.xlsx", onChange, className = "" }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onChange?.(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      onChange?.(droppedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    onChange?.(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'doc':
      case 'docx': return 'Word';
      case 'xls':
      case 'xlsx': return 'Excel';
      default: return 'Fayl';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[14px] font-medium text-[#5f6368] mb-2">
        {label}
      </label>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer group hover:border-[#4285F4] hover:bg-[#f8f9fa] ${isDragging ? 'border-[#4285F4] bg-[#f8f9fa]' : 'border-[#dadce0]'
            }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-[#e8f0fe] flex items-center justify-center group-hover:bg-[#d2e3fc] transition-colors">
              <UploadIcon className="w-8 h-8 text-[#1a73e8]" />
            </div>
            <p className="text-[16px] font-medium text-[#202124] mb-1">
              Sənədi yükləyin
            </p>
            <p className="text-[14px] text-[#5f6368]">
              və ya bura sürüşdürün
            </p>
            <p className="text-[12px] text-[#80868b] mt-2">
              PDF, DOC, DOCX, XLS, XLSX
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-[#dadce0] rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#d2e3fc] transition-colors"
              onClick={() => setIsPreviewOpen(true)}
              title="Önizləmə"
            >
              <FileIcon className="w-6 h-6 text-[#1a73e8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#202124] truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] text-[#5f6368]">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#e8f0fe] text-[#1a73e8] rounded font-medium">
                  {getFileTypeLabel(file.name)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-[#e8f0fe] flex items-center justify-center transition-colors shrink-0"
              title="Önizləmə"
            >
              <EyeIcon className="w-5 h-5 text-[#1a73e8]" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-9 h-9 rounded-full hover:bg-[#fce8e6] flex items-center justify-center transition-colors shrink-0"
              title="Sil"
            >
              <XIcon className="w-5 h-5 text-[#d93025]" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <FilePreviewModal
        file={file}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};
