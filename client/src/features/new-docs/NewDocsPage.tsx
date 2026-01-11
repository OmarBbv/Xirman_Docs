import { useState } from 'react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { FileUpload } from '../ui/file-upload';
import { Button } from '../ui/button';

export default function NewDocsPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    amount: '',
    documentDate: '',
    uploadDate: new Date().toISOString().split('T')[0],
    documentFormat: '',
    uploadedBy: '',
    file: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: API çağırışı əlavə ediləcək
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, file }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8f9fa] to-[#e8eaed]">
      {/* Header */}
      <div className="bg-linear-to-r from-[#1a73e8] to-[#4285f4] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
          Yeni Sənəd Yarat
        </h1>
        <p className="text-white/90 text-[15px]">
          Sistemə yeni sənəd əlavə etmək üçün aşağıdakı formu doldurun
        </p>
      </div>

      {/* Form */}
      <div className="bg-white p-1 md:px-0 md:py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              label="Şirkət adı"
              placeholder="Şirkət adı"
              required
              className="w-full"
            />
            <Input
              type="number"
              label="Məbləğ"
              placeholder="Məbləğ"
              required
              className="w-full"
            />
          </div>

          {/* Document Date & Upload Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              label="Sənədin tarixi"
              placeholder="Sənədin tarixi"
              required
              className="w-full"
            />
            <Input
              type="date"
              label="Sistemə yüklənmə tarixi"
              placeholder="Sistemə yüklənmə tarixi"
              defaultValue={formData.uploadDate}
              disabled
              className="w-full"
            />
          </div>

          {/* Document Format & Uploaded By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Sənəd formatı"
              options={['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX']}
              className="w-full"
            />
            <Input
              type="text"
              label="Sənədi yükləyən istifadəçi"
              placeholder="İstifadəçi adı"
              required
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div className="pt-2">
            <FileUpload
              label="Sənəd faylı"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[#dadce0] my-8"></div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition-colors font-medium"
            >
              Ləğv et
            </button>
            <Button
              type="submit"
              className="px-8 py-3 font-medium text-[15px]"
            >
              Sənəd Yarat
            </Button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-[#e8f0fe] border-t border-[#d2e3fc] p-6 md:px-12 lg:px-16">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-[#1a73e8] mb-1">
              Məlumat
            </h3>
            <p className="text-[13px] text-[#5f6368] leading-relaxed">
              Bütün sahələr mütləqdir. Sənəd yüklənməzdən əvvəl bütün məlumatların düzgünlüyünü yoxlayın.
              Maksimum fayl ölçüsü 10MB-dır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}