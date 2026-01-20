import { useState } from 'react';
import { UploadIcon, FileIcon, XIcon, EyeIcon, PdfIcon, WordIcon, ExcelIcon } from './Icons';
import { FilePreviewModal } from './FilePreviewModal';

interface Props {
  label: string;
  accept?: string;
  onChange?: (files: File[]) => void;
  className?: string;
  multiple?: boolean;
}

export const FileUpload = ({ label, accept = ".pdf,.doc,.docx,.xls,.xlsx", onChange, className = "", multiple = false }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      if (multiple) {
        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onChange?.(newFiles);
      } else {
        setFiles([selectedFiles[0]]);
        onChange?.([selectedFiles[0]]);
      }
    }
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (multiple) {
        const newFiles = [...files, ...droppedFiles];
        setFiles(newFiles);
        onChange?.(newFiles);
      } else {
        setFiles([droppedFiles[0]]);
        onChange?.([droppedFiles[0]]);
      }
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-5 h-5";
    switch (ext) {
      case 'pdf':
        return <PdfIcon className={iconClass} />;
      case 'doc':
      case 'docx':
        return <WordIcon className={iconClass} />;
      case 'xls':
      case 'xlsx':
        return <ExcelIcon className={iconClass} />;
      default:
        return <FileIcon className={iconClass} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[14px] font-medium text-[#5f6368] mb-2">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg transition-all cursor-pointer group hover:border-[#4285F4] hover:bg-[#f8f9fa] ${isDragging ? 'border-[#4285F4] bg-[#f8f9fa]' : 'border-[#dadce0]'
          } ${files.length > 0 && !multiple ? 'hidden' : ''}`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-12 h-12 mb-3 rounded-full bg-[#e8f0fe] flex items-center justify-center group-hover:bg-[#d2e3fc] transition-colors">
            <UploadIcon className="w-6 h-6 text-[#1a73e8]" />
          </div>
          <p className="text-[14px] font-medium text-[#202124] mb-1">
            {multiple && files.length > 0 ? 'Daha çox fayl əlavə et' : 'Sənədləri yükləyin'}
          </p>
          <p className="text-[12px] text-[#5f6368]">
            və ya bura sürüşdürün
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file, index) => (
            <div key={index} className="border border-[#dadce0] rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#d2e3fc] transition-colors"
                  onClick={() => setPreviewFile(file)}
                  title="Önizləmə"
                >
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#202124] truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#5f6368]">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#e8f0fe] text-[#1a73e8] rounded font-medium">
                      {getFileTypeLabel(file.name)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="w-8 h-8 rounded-full hover:bg-[#e8f0fe] flex items-center justify-center transition-colors shrink-0"
                  title="Önizləmə"
                >
                  <EyeIcon className="w-4 h-4 text-[#1a73e8]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="w-8 h-8 rounded-full hover:bg-[#fce8e6] flex items-center justify-center transition-colors shrink-0"
                  title="Sil"
                >
                  <XIcon className="w-4 h-4 text-[#d93025]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
