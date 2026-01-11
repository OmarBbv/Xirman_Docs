import { useState } from 'react';
import { UploadIcon, FileIcon, XIcon } from './Icons';

interface Props {
  label: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  className?: string;
}

export const FileUpload = ({ label, accept = ".pdf,.doc,.docx,.xls,.xlsx", onChange, className = "" }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        <div className="border border-[#dadce0] rounded-lg p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#e8f0fe] flex items-center justify-center shrink-0">
              <FileIcon className="w-6 h-6 text-[#1a73e8]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#202124] truncate">
                {file.name}
              </p>
              <p className="text-[12px] text-[#5f6368]">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-full hover:bg-[#f1f3f4] flex items-center justify-center transition-colors shrink-0"
            >
              <XIcon className="w-5 h-5 text-[#5f6368]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
