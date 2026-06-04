import { useEffect, useState } from 'react';
import { Modal, Select, DatePicker } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { useTranslations } from 'use-intl';
import dayjs from 'dayjs';
import { Input } from './input';
import { FileUpload } from './file-upload';
import { Button } from './button';
import { MultiSelect } from './MultiSelect';
import { DocumentType } from '../types/document.types';
import type { Document } from '../types/document.types';
import { useUpdateDocument } from '../hooks/documentHooks';

interface DocumentEditModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditDocumentForm {
  companyName: string;
  documentNumber: string;
  amount: string;
  documentDate: string;
  documentType: string;
  department: string;
  allowedPositions: string[];
}

export function DocumentEditModal({ document, isOpen, onClose }: DocumentEditModalProps) {
  const t = useTranslations('NewDocumentPage');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const updateDocument = useUpdateDocument();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditDocumentForm>({
    defaultValues: {
      companyName: '',
      documentNumber: '',
      amount: '',
      documentDate: '',
      documentType: '',
      department: '',
      allowedPositions: [],
    },
  });

  useEffect(() => {
    if (document && isOpen) {
      reset({
        companyName: document.companyName || '',
        documentNumber: document.documentNumber || '',
        amount: document.amount || '',
        documentDate: document.documentDate ? dayjs(document.documentDate).format('YYYY-MM-DD') : '',
        documentType: document.documentType || '',
        department: document.department || '',
        allowedPositions: document.allowedPositions || [],
      });
      setSelectedFile(null);
    }
  }, [document, isOpen, reset]);

  const onSubmit = (data: EditDocumentForm) => {
    if (!document) return;

    updateDocument.mutate(
      {
        id: document.id,
        data: {
          companyName: data.companyName,
          documentNumber: data.documentNumber,
          amount: data.amount,
          documentDate: data.documentDate,
          documentType: data.documentType as DocumentType,
          department: data.department,
          allowedPositions: data.allowedPositions,
        },
        file: selectedFile || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleFileChange = (files: File[]) => {
    setSelectedFile(files[0] || null);
  };

  const documentTypeOptions = [
    { value: 'contract', label: t('types.contract') },
    { value: 'contract_addendum', label: t('types.contract_addendum') },
    { value: 'invoice', label: t('types.invoice') },
    { value: 'act', label: t('types.act') },
    { value: 'report', label: t('types.report') },
    { value: 'letter', label: t('types.letter') },
    { value: 'order', label: t('types.order') },
    { value: 'reconciliation_act', label: t('types.reconciliation_act') },
    { value: 'handover_act', label: t('types.handover_act') },
    { value: 'cash_receipt_order', label: t('types.cash_receipt_order') },
    { value: 'cash_expenditure_order', label: t('types.cash_expenditure_order') },
    { value: 'cash_z_report', label: t('types.cash_z_report') },
    { value: 'legal_documents', label: t('types.legal_documents') },
    { value: 'production_form', label: t('types.production_form') },
    { value: 'defect_installation_act', label: t('types.defect_installation_act') },
    { value: 'write_off_act', label: t('types.write_off_act') },
    { value: 'warehouse_transfer', label: t('types.warehouse_transfer') },
    { value: 'sales_invoice', label: t('types.sales_invoice') },
    { value: 'employment_order', label: t('types.employment_order') },
    { value: 'termination_order', label: t('types.termination_order') },
    { value: 'vacation_order', label: t('types.vacation_order') },
    { value: 'business_trip_order', label: t('types.business_trip_order') },
    { value: 'sick_leave', label: t('types.sick_leave') },
    { value: 'protocol', label: t('types.protocol') },
    { value: 'timesheet', label: t('types.timesheet') },
    { value: 'waybill_requisition', label: t('types.waybill_requisition') },
    { value: 'financial_reports', label: t('types.financial_reports') },
    { value: 'incoming_letter', label: t('types.incoming_letter') },
    { value: 'outgoing_letter', label: t('types.outgoing_letter') },
    { value: 'employee_personal_file', label: t('types.employee_personal_file') },
  ];

  const positionOptions = [
    { value: 'manager', label: t('positions.manager') },
    { value: 'accountant', label: t('positions.accountant') },
    { value: 'hr', label: t('positions.hr') },
    { value: 'finance_manager', label: t('positions.finance_manager') },
    { value: 'sales_specialist', label: t('positions.sales_specialist') },
    { value: 'sales_manager', label: t('positions.sales_manager') },
    { value: 'warehouseman', label: t('positions.warehouseman') },
    { value: 'director', label: t('positions.director') },
  ];

  const departmentOptions = [
    { value: 'mill', label: t('departments.mill') },
    { value: 'dairy', label: t('departments.dairy') },
    { value: 'sausage', label: t('departments.sausage') },
    { value: 'other_service', label: t('departments.other_service') },
  ];

  return (
    <Modal
      title="Sənədə Düzəliş Et"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      centered
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
            step="any"
            label={t('form.amount')}
            placeholder={t('form.amountPlaceholder')}
            {...register('amount')}
            error={errors.amount?.message}
          />

          <div className="w-full">
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

          <div className="w-full">
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

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.department')}
            </label>
            <Controller
              name="department"
              control={control}
              rules={{ required: t('form.departmentRequired') }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={t('form.departmentPlaceholder')}
                  className="w-full h-[50px] h-50-select"
                  options={departmentOptions}
                  status={errors.department ? 'error' : ''}
                  value={field.value || undefined}
                />
              )}
            />
            {errors.department && (
              <p className="text-red-500 text-[12px] mt-1 ml-1">
                {errors.department.message}
              </p>
            )}
          </div>
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
              />
            )}
          />
        </div>

        <div className="pt-2">
          <FileUpload
            label={"Yeni fayl yüklə (Opsional - mövcud faylı dəyişmək üçün)"}
            labelClassName="text-center"
            onChange={handleFileChange}
            className="w-full"
            multiple={false}
          />
          {selectedFile && (
            <p className="text-green-600 text-[12px] mt-2 text-center">
              1 fayl seçilib: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="border-t border-[#dadce0] my-6"></div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-[#5f6368] border-none rounded-lg"
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            type="submit"
            className="px-6 py-2 rounded-lg"
            disabled={updateDocument.isPending}
          >
            {updateDocument.isPending ? t('buttons.loading') : "Yadda Saxla"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
