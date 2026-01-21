import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../ui/input';
import { FileUpload } from '../ui/file-upload';
import { Button } from '../ui/button';
import { ArrowLeftIcon } from '../ui/Icons';
import { useUploadDocument } from '../hooks/documentHooks';
import { DocumentType } from '../types/document.types';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useTranslations } from 'use-intl';
import { MultiSelect } from '../ui/MultiSelect';
import { useAuth } from '../../context/AuthContext';

interface NewDocumentForm {
  companyName: string;
  documentNumber: string;
  amount: string;
  documentDate: string;
  documentType: string;
  allowedPositions: string[];
}

export default function NewDocsPage() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const uploadDocument = useUploadDocument();
  const t = useTranslations('NewDocumentPage');
  const { user } = useAuth();

  const userPosition = user?.position || '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewDocumentForm>({
    defaultValues: {
      companyName: '',
      documentNumber: '',
      amount: '',
      documentDate: '',
      documentType: '',
      allowedPositions: userPosition ? [userPosition] : [],
    },
  });

  const onSubmit = (data: NewDocumentForm) => {
    if (selectedFiles.length === 0) {
      return;
    }

    uploadDocument.mutate(
      {
        data: {
          companyName: data.companyName,
          documentNumber: data.documentNumber,
          amount: data.amount ? parseFloat(data.amount) : undefined,
          documentDate: data.documentDate,
          documentType: data.documentType as DocumentType,
          allowedPositions: data.allowedPositions,
        },
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          navigate('/dashboard/docs');
        },
      }
    );
  };

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const documentTypeOptions = [
    { value: 'contract', label: t('types.contract') },
    { value: 'invoice', label: t('types.invoice') },
    { value: 'act', label: t('types.act') },
    { value: 'report', label: t('types.report') },
    { value: 'letter', label: t('types.letter') },
    { value: 'order', label: t('types.order') },
    { value: 'other', label: t('types.other') },
  ];

  const positionOptions = [
    { value: 'manager', label: t('positions.manager') },
    { value: 'accountant', label: t('positions.accountant') },
    { value: 'hr', label: t('positions.hr') },
    { value: 'finance_manager', label: t('positions.finance_manager') },
    { value: 'sales_specialist', label: t('positions.sales_specialist') },
    { value: 'warehouseman', label: t('positions.warehouseman') },
    { value: 'director', label: t('positions.director') },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-linear-to-r from-[#1a73e8] to-[#4285f4] p-8 shadow-lg flex items-center gap-6">
        <button
          onClick={() => navigate('/dashboard/docs')}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
          title={t('back')}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-white/90 text-[15px]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 md:py-8 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              type="text"
              label={t('form.companyName')}
              placeholder={t('form.companyPlaceholder')}
              {...register('companyName', { required: t('form.companyRequired') })}
              error={errors.companyName?.message}
            />
            <Input
              type="text"
              label={t('form.documentNumber')}
              placeholder={t('form.documentNumberPlaceholder')}
              {...register('documentNumber')}
              error={errors.documentNumber?.message}
            />
            <Input
              type="number"
              label={t('form.amount')}
              placeholder={t('form.amountPlaceholder')}
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.date')}
              </label>
              <Controller
                name="documentDate"
                control={control}
                rules={{ required: t('form.dateRequired') }}
                render={({ field }) => (
                  <DatePicker
                    className="w-full h-[50px]"
                    placeholder={t('form.datePlaceholder')}
                    status={errors.documentDate ? 'error' : ''}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(_, dateString) => field.onChange(dateString)}
                    format="YYYY-MM-DD"
                  />
                )}
              />
              {errors.documentDate && (
                <p className="text-red-500 text-[12px] mt-1 ml-1">
                  {errors.documentDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.type')}
              </label>
              <Controller
                name="documentType"
                control={control}
                rules={{ required: t('form.typeRequired') }}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t('form.typePlaceholder')}
                    className="w-full h-[50px] h-50-select"
                    options={documentTypeOptions}
                    status={errors.documentType ? 'error' : ''}
                    value={field.value || undefined}
                  />
                )}
              />
              {errors.documentType && (
                <p className="text-red-500 text-[12px] mt-1 ml-1">
                  {errors.documentType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.allowedPositions')}
              </label>
              <Controller
                name="allowedPositions"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={positionOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder={t('form.allowedPositionsPlaceholder')}
                    allowClear
                    lockedValues={userPosition ? [userPosition] : []}
                  />
                )}
              />
            </div>
          </div>

          <div className="pt-2">
            <FileUpload
              label={t('form.file')}
              onChange={handleFileChange}
              className="w-full"
              multiple={true}
            />
            {selectedFiles.length === 0 && (
              <p className="text-amber-600 text-[12px] mt-2">
                {t('form.fileRequired')}
              </p>
            )}
            {selectedFiles.length > 0 && (
              <p className="text-green-600 text-[12px] mt-2">
                {selectedFiles.length} fayl seçilib
              </p>
            )}
          </div>

          <div className="border-t border-[#dadce0] my-8"></div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/docs')}
              className="px-6 py-3 text-[#5f6368] hover:bg-[#f1f3f4] rounded-lg transition-colors font-medium cursor-pointer"
            >
              {t('buttons.cancel')}
            </button>
            <Button
              type="submit"
              className="px-8 py-3 font-medium text-[15px]"
              disabled={uploadDocument.isPending || selectedFiles.length === 0}
            >
              {uploadDocument.isPending ? t('buttons.loading') : t('buttons.create')}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-[#e8f0fe] border-t border-[#d2e3fc] p-6 md:px-12 lg:px-16">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-[#1a73e8] mb-1">
              {t('info.title')}
            </h3>
            <p className="text-[13px] text-[#5f6368] leading-relaxed">
              {t('info.content')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}