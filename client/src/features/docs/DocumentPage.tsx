import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentTable } from "../ui/document-table";
import {
  useDocuments,
  useDeleteDocument,
  useDownloadDocument,
  useDocumentStats,
  useDocumentYears,
  useCompaniesForYear,
} from "../hooks/documentHooks";
import type { FilterDocumentDto, FileFormat } from "../types/document.types";
import { Collapse, DatePicker, InputNumber, Button as AntButton, Row, Col, Form, Badge, Select } from "antd";
import { FilterOutlined, ClearOutlined, SearchOutlined, DownloadOutlined, CheckSquareOutlined, CloseSquareOutlined } from "@ant-design/icons";
import { useTranslations } from "use-intl";
import { documentService } from "../services/documentServices";
import { message } from "antd";
import { YearFolderView, CompanyFolderView, FolderBreadcrumb } from "../ui/FolderView";


const { RangePicker } = DatePicker;

export default function DocumentPage() {
  const navigate = useNavigate();
  const { year: yearParam, company: companyParam } = useParams<{ year?: string; company?: string }>();
  const [form] = Form.useForm();
  const t = useTranslations('DocumentsPage');

  const currentYear = yearParam ? parseInt(yearParam) : null;
  const currentCompany = companyParam ? decodeURIComponent(companyParam) : null;

  const [filters, setFilters] = useState<FilterDocumentDto>({
    page: 1,
    limit: 10,
  });

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  const activeFilterCount = Object.keys(filters).filter(k =>
    k !== 'page' && k !== 'limit' && filters[k as keyof FilterDocumentDto] !== undefined
  ).length;

  const { data: yearsData, isLoading: yearsLoading } = useDocumentYears();
  const { data: companiesData, isLoading: companiesLoading } = useCompaniesForYear(currentYear);

  const documentFilters: FilterDocumentDto = {
    ...filters,
    startDate: filters.startDate || (currentYear ? `${currentYear}-01-01` : undefined),
    endDate: filters.endDate || (currentYear ? `${currentYear}-12-31` : undefined),
    companyName: currentCompany || undefined,
    exactCompanyMatch: !!currentCompany,
  };

  const { data: documentsData, isLoading, refetch } = useDocuments(
    currentCompany ? documentFilters : { page: 1, limit: 1 }
  );
  const { data: statsData } = useDocumentStats();
  const deleteDocument = useDeleteDocument();
  const downloadDocument = useDownloadDocument();

  const stats = [
    {
      label: t('stats.total'),
      value: statsData?.total || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "PDF",
      value: statsData?.pdfCount || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      bgLight: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      label: "Word",
      value: statsData?.wordCount || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgLight: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      label: "Excel",
      value: statsData?.excelCount || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      bgLight: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  const handleFilterSubmit = (values: any) => {
    const newFilters: FilterDocumentDto = {
      page: 1,
      limit: filters.limit,
      companyName: currentCompany || values.companyName,
      documentType: values.documentType,
      minAmount: values.minAmount,
      maxAmount: values.maxAmount,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD') || (currentYear ? `${currentYear}-01-01` : undefined),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') || (currentYear ? `${currentYear}-12-31` : undefined),
      fileFormat: filters.fileFormat,
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    form.resetFields();
    setFilters({
      page: 1,
      limit: filters.limit,
      fileFormat: filters.fileFormat,
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }));
  };

  const handleDelete = (id: number) => {
    deleteDocument.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleDownload = (id: number, fileName: string) => {
    downloadDocument.mutate({ id, fileName });
  };

  const handleFilterByFormat = (format: FileFormat | undefined) => {
    setFilters(prev => ({ ...prev, fileFormat: format, page: 1 }));
  };

  const handleShare = async (id: number) => {
    try {
      const response = await documentService.getShareLink(id);
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

  const handleYearFolderOpen = (year: number) => {
    navigate(`/dashboard/docs/year/${year}`);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCompanyFolderOpen = (companyName: string) => {
    navigate(`/dashboard/docs/year/${currentYear}/company/${encodeURIComponent(companyName)}`);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleBackToRoot = () => {
    navigate('/dashboard/docs');
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleBackToYear = () => {
    navigate(`/dashboard/docs/year/${currentYear}`);
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedIds([]);
    }
  };

  const selectAll = () => {
    const allIds = documentsData?.data?.map(doc => doc.id) || [];
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) {
      message.warning('Ən azı bir sənəd seçin');
      return;
    }

    setBulkDownloading(true);
    try {
      const blob = await documentService.bulkDownload(selectedIds);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `senedler_${currentYear || 'all'}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success(`${selectedIds.length} sənəd uğurla yükləndi`);
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      message.error('Toplu yükləmə zamanı xəta baş verdi');
    } finally {
      setBulkDownloading(false);
    }
  };

  const isAtRoot = !currentYear && !currentCompany;
  const isAtYearLevel = currentYear && !currentCompany;
  const isAtCompanyLevel = currentYear && currentCompany;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg md:shadow-lg p-5 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-blue-100 text-xs md:text-sm">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/docs/new')}
              className="cursor-pointer bg-white text-[#2271b1] px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm font-semibold md:shadow-md transition-all flex items-center gap-2 hover:bg-blue-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t('newDocument')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 md:shadow-sm p-4 md:p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300">
            <div className="flex items-center justify-between">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <FolderBreadcrumb
          currentYear={currentYear}
          currentCompany={currentCompany}
          onBackToRoot={handleBackToRoot}
          onBackToYear={handleBackToYear}
        />

        {isAtRoot && (
          <YearFolderView
            years={yearsData || []}
            isLoading={yearsLoading}
            onFolderOpen={handleYearFolderOpen}
          />
        )}

        {isAtYearLevel && (
          <CompanyFolderView
            companies={companiesData || []}
            isLoading={companiesLoading}
            onFolderOpen={handleCompanyFolderOpen}
          />
        )}

        {isAtCompanyLevel && (
          <div className="p-4 md:p-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-4 border-b border-gray-200 px-4 pt-4">
              <div className="flex items-center gap-1 overflow-x-auto flex-1">
                <button
                  onClick={() => handleFilterByFormat(undefined)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${!filters.fileFormat ? "text-white bg-[#2271b1]" : "text-gray-600 hover:text-[#2271b1] hover:bg-blue-50"
                    }`}
                >
                  {t('filters.all')} ({documentsData?.total || 0})
                </button>
                <button
                  onClick={() => handleFilterByFormat("pdf" as FileFormat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filters.fileFormat === "pdf" ? "text-white bg-red-500" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => handleFilterByFormat("word" as FileFormat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filters.fileFormat === "word" ? "text-white bg-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  Word
                </button>
                <button
                  onClick={() => handleFilterByFormat("excel" as FileFormat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filters.fileFormat === "excel" ? "text-white bg-green-600" : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                >
                  Excel
                </button>
              </div>

              {/* Selection mode controls */}
              <div className="flex items-center gap-2">
                {!selectionMode ? (
                  <AntButton
                    icon={<CheckSquareOutlined />}
                    onClick={toggleSelectionMode}
                  >
                    {t('table.selectMode')}
                  </AntButton>
                ) : (
                  <>
                    <AntButton
                      type="primary"
                      danger
                      icon={<CloseSquareOutlined />}
                      onClick={toggleSelectionMode}
                    >
                      {t('table.closeSelection')}
                    </AntButton>
                    <AntButton
                      onClick={selectAll}
                    >
                      {t('table.selectAll')}
                    </AntButton>
                    <AntButton
                      onClick={deselectAll}
                    >
                      {t('table.deselectAll')}
                    </AntButton>

                    {selectedIds.length > 0 && (
                      <AntButton
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleBulkDownload}
                        loading={bulkDownloading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {t('table.bulkDownload')} ({selectedIds.length} {t('table.selected')})
                      </AntButton>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mb-6 px-4">
              <Collapse
                ghost
                items={[
                  {
                    key: '1',
                    label: (
                      <span className="text-gray-600 font-medium flex items-center gap-2">
                        <FilterOutlined />
                        {t('filters.detailedSearch')}
                        {activeFilterCount > 0 && (
                          <Badge count={activeFilterCount} style={{ backgroundColor: '#2271b1' }} />
                        )}
                      </span>
                    ),
                    children: (
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFilterSubmit}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="documentType" label={t('filters.documentType')}>
                              <Select placeholder={t('filters.selectRequest')} allowClear>
                                <Select.Option value="contract">{t('types.contract')}</Select.Option>
                                <Select.Option value="invoice">{t('types.invoice')}</Select.Option>
                                <Select.Option value="act">{t('types.act')}</Select.Option>
                                <Select.Option value="report">{t('types.report')}</Select.Option>
                                <Select.Option value="letter">{t('types.letter')}</Select.Option>
                                <Select.Option value="order">{t('types.order')}</Select.Option>
                                <Select.Option value="other">{t('types.other')}</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item label={t('filters.amountRange')}>
                              <div className="flex gap-2">
                                <Form.Item name="minAmount" noStyle>
                                  <InputNumber placeholder={t('filters.min')} className="w-full" min={0} />
                                </Form.Item>
                                <span className="text-gray-400 self-center">-</span>
                                <Form.Item name="maxAmount" noStyle>
                                  <InputNumber placeholder={t('filters.max')} className="w-full" min={0} />
                                </Form.Item>
                              </div>
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="dateRange" label={t('filters.dateRange')}>
                              <RangePicker className="w-full" placeholder={[t('filters.startDate'), t('filters.endDate')]} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <div className="flex gap-3">
                          <AntButton icon={<ClearOutlined />} onClick={clearFilters}>
                            {t('filters.clear')}
                          </AntButton>
                          <AntButton type="primary" htmlType="submit" icon={<SearchOutlined />} className="bg-[#2271b1]">
                            {t('filters.search')}
                          </AntButton>
                        </div>
                      </Form>
                    ),
                  },
                ]}
              />
            </div>

            <DocumentTable
              data={documentsData?.data || []}
              loading={isLoading}
              onView={(id: number) => navigate(`/dashboard/docs/${id}`)}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              pagination={{
                current: filters.page || 1,
                pageSize: filters.limit || 10,
                total: documentsData?.total || 0,
                onChange: handlePageChange,
              }}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        )}
      </div>
    </div >
  );
}