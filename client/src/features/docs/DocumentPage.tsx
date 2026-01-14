import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentTable } from "../ui/document-table";
import {
  useDocuments,
  useDeleteDocument,
  useDownloadDocument,
  useDocumentStats,
} from "../hooks/documentHooks";
import type { FilterDocumentDto, FileFormat } from "../types/document.types";
import { Collapse, DatePicker, InputNumber, Button as AntButton, Row, Col, Form, Badge, Select, Input } from "antd";
import { FilterOutlined, ClearOutlined, SearchOutlined } from "@ant-design/icons";


const { RangePicker } = DatePicker;

export default function DocumentPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Filtr state-ləri
  const [filters, setFilters] = useState<FilterDocumentDto>({
    page: 1,
    limit: 10,
  });

  // Aktiv filter sayı
  const activeFilterCount = Object.keys(filters).filter(k =>
    k !== 'page' && k !== 'limit' && filters[k as keyof FilterDocumentDto] !== undefined
  ).length;

  // Hooks
  const { data: documentsData, isLoading, refetch } = useDocuments(filters);
  const { data: statsData } = useDocumentStats();
  const deleteDocument = useDeleteDocument();
  const downloadDocument = useDownloadDocument();

  // Statistikalar
  const stats = [
    {
      label: "Toplam Sənəd",
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

  // Axtarış və filtrasiya
  const handleFilterSubmit = (values: any) => {
    const newFilters: FilterDocumentDto = {
      page: 1,
      limit: filters.limit,
      companyName: values.companyName,
      documentType: values.documentType,
      minAmount: values.minAmount,
      maxAmount: values.maxAmount,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      fileFormat: filters.fileFormat, // Tab-dan gələn dəyəri qoru
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    form.resetFields();
    setFilters({
      page: 1,
      limit: filters.limit,
      fileFormat: filters.fileFormat, // Tab-dan gələn dəyəri qoru
    });
  };

  // Pagination
  const handlePageChange = (page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }));
  };

  // Sənədi sil
  const handleDelete = (id: number) => {
    deleteDocument.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  // Sənədi yüklə
  const handleDownload = (id: number, fileName: string) => {
    downloadDocument.mutate({ id, fileName });
  };

  // Fayl formatına görə filtr
  const handleFilterByFormat = (format: FileFormat | undefined) => {
    setFilters(prev => ({ ...prev, fileFormat: format, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modern Header Section */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Sənəd İdarəetməsi</h1>
            <p className="text-blue-100 text-sm">Bütün sənədlərinizi buradan idarə edə bilərsiniz</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/docs/new')}
              className="cursor-pointer bg-white text-[#2271b1] px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all flex items-center gap-2 hover:bg-blue-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Sənəd
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300">
            <div className="flex items-center justify-between">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 pb-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => handleFilterByFormat(undefined)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${!filters.fileFormat ? "text-white bg-[#2271b1]" : "text-gray-600 hover:text-[#2271b1] hover:bg-blue-50"
              }`}
          >
            Hamısı ({documentsData?.total || 0})
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

        {/* Detailed Filters */}
        <div className="mb-6">
          <Collapse
            ghost
            items={[
              {
                key: '1',
                label: (
                  <span className="text-gray-600 font-medium flex items-center gap-2">
                    <FilterOutlined />
                    Ətraflı Axtarış
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
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item name="companyName" label="Şirkət adı">
                          <Input placeholder="Şirkət adı daxil edin" allowClear />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item name="documentType" label="Sənəd növü">
                          <Select placeholder="Seçin" allowClear>
                            <Select.Option value="contract">Müqavilə</Select.Option>
                            <Select.Option value="invoice">Faktura</Select.Option>
                            <Select.Option value="act">Akt</Select.Option>
                            <Select.Option value="report">Hesabat</Select.Option>
                            <Select.Option value="letter">Məktub</Select.Option>
                            <Select.Option value="order">Sifariş</Select.Option>
                            <Select.Option value="other">Digər</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item name="dateRange" label="Tarix aralığı">
                          <RangePicker className="w-full" placeholder={['Başlama', 'Bitmə']} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Form.Item label="Məbləğ aralığı (AZN)">
                          <div className="flex gap-2">
                            <Form.Item name="minAmount" noStyle>
                              <InputNumber placeholder="Min" className="w-full" min={0} />
                            </Form.Item>
                            <span className="text-gray-400 self-center">-</span>
                            <Form.Item name="maxAmount" noStyle>
                              <InputNumber placeholder="Max" className="w-full" min={0} />
                            </Form.Item>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                    <div className="flex gap-3">
                      <AntButton icon={<ClearOutlined />} onClick={clearFilters}>
                        Təmizlə
                      </AntButton>
                      <AntButton type="primary" htmlType="submit" icon={<SearchOutlined />} className="bg-[#2271b1]">
                        Axtar
                      </AntButton>
                    </div>
                  </Form>
                ),
              },
            ]}
          />
        </div>

        {/* Table */}
        <DocumentTable
          data={documentsData?.data || []}
          loading={isLoading}
          onView={(id: number) => navigate(`/dashboard/docs/${id}`)}
          onDownload={handleDownload}
          onDelete={handleDelete}
          pagination={{
            current: filters.page || 1,
            pageSize: filters.limit || 10,
            total: documentsData?.total || 0,
            onChange: handlePageChange,
          }}
        />
      </div>
    </div>
  );
}