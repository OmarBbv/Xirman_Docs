import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../ui/input';
import { FileUpload } from '../ui/file-upload';
import { Button } from '../ui/button';
import { ArrowLeftIcon } from '../ui/Icons';
import { useUploadDocument } from '../hooks/documentHooks';
import { DocumentType } from '../types/document.types';
import { Select } from 'antd';

interface NewDocumentForm {
  companyName: string;
  amount: string;
  documentDate: string;
  documentType: string;
}

export default function NewDocsPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadDocument = useUploadDocument();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewDocumentForm>({
    defaultValues: {
      companyName: '',
      amount: '',
      documentDate: '',
      documentType: '',
    },
  });

  const onSubmit = (data: NewDocumentForm) => {
    if (!selectedFile) {
      return;
    }

    uploadDocument.mutate(
      {
        data: {
          companyName: data.companyName,
          amount: data.amount ? parseFloat(data.amount) : undefined,
          documentDate: data.documentDate,
          documentType: data.documentType as DocumentType,
        },
        file: selectedFile,
      },
      {
        onSuccess: () => {
          navigate('/dashboard/docs');
        },
      }
    );
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const documentTypeOptions = [
    { value: 'contract', label: 'Müqavilə' },
    { value: 'invoice', label: 'Faktura' },
    { value: 'act', label: 'Akt' },
    { value: 'report', label: 'Hesabat' },
    { value: 'letter', label: 'Məktub' },
    { value: 'order', label: 'Sifariş' },
    { value: 'other', label: 'Digər' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8f9fa] to-[#e8eaed]">
      {/* Header */}
      <div className="bg-linear-to-r from-[#1a73e8] to-[#4285f4] p-8 shadow-lg flex items-center gap-6">
        <button
          onClick={() => navigate('/dashboard/docs')}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          title="Geri qayıt"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Yeni Sənəd Yarat
          </h1>
          <p className="text-white/90 text-[15px]">
            Sistemə yeni sənəd əlavə etmək üçün aşağıdakı formu doldurun
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 md:px-8 md:py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Name & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              label="Şirkət adı"
              placeholder="Şirkət adını daxil edin"
              {...register('companyName', { required: 'Şirkət adı mütləqdir' })}
              error={errors.companyName?.message}
            />
            <Input
              type="number"
              label="Məbləğ (AZN)"
              placeholder="Məbləği daxil edin"
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>

          {/* Document Date & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              label="Sənədin tarixi"
              {...register('documentDate', { required: 'Sənədin tarixi mütləqdir' })}
              error={errors.documentDate?.message}
            />
            <div className="relative">
              <label className="text-[12px] text-[#1a73e8] bg-white px-1 absolute -top-2.5 left-3 z-10">
                Sənəd növü
              </label>
              <Controller
                name="documentType"
                control={control}
                rules={{ required: 'Sənəd növü seçilməlidir' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Sənəd növünü seçin"
                    className="w-full h-[54px]"
                    options={documentTypeOptions}
                    status={errors.documentType ? 'error' : ''}
                  />
                )}
              />
              {errors.documentType && (
                <p className="text-red-500 text-[12px] mt-1 ml-1">
                  {errors.documentType.message}
                </p>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="pt-2">
            <FileUpload
              label="Sənəd faylı (PDF, Word, Excel)"
              onChange={handleFileChange}
              className="w-full"
            />
            {!selectedFile && (
              <p className="text-amber-600 text-[12px] mt-2">
                * Fayl seçilməlidir
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#dadce0] my-8"></div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/docs')}
              className="px-6 py-3 text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition-colors font-medium cursor-pointer"
            >
              Ləğv et
            </button>
            <Button
              type="submit"
              className="px-8 py-3 font-medium text-[15px]"
              disabled={uploadDocument.isPending || !selectedFile}
            >
              {uploadDocument.isPending ? 'Yüklənir...' : 'Sənəd Yarat'}
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
              Sənəd yükləndikdən sonra yükləyən istifadəçi avtomatik olaraq sizin hesabınız kimi qeyd olunacaq.
              Maksimum fayl ölçüsü 10MB-dır. Yalnız PDF, Word və Excel formatları qəbul edilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}