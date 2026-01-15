import { useNavigate } from "react-router-dom";
import { useDocuments, useDocumentStats, useRecentActivities } from "../hooks/documentHooks";
import { Spin, Table, Tag, Button, Card } from "antd";

export default function HomePage() {
  const navigate = useNavigate();

  // Real data hooks
  const { data: statsData, isLoading: isStatsLoading } = useDocumentStats();
  const { data: recentDocsData, isLoading: isDocsLoading } = useDocuments({ page: 1, limit: 5 });
  const { data: activities, isLoading: isActivitiesLoading } = useRecentActivities();

  if (isStatsLoading || isDocsLoading || isActivitiesLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  // Format charts data
  const documentTypeData = [
    { label: "PDF Sənədlər", value: statsData?.pdfCount || 0, color: "bg-[#2271b1]", lightColor: "bg-blue-100" },
    { label: "Word (DOCX)", value: statsData?.wordCount || 0, color: "bg-[#34A853]", lightColor: "bg-green-100" },
    { label: "Excel (XLSX)", value: statsData?.excelCount || 0, color: "bg-[#FBBC05]", lightColor: "bg-yellow-100" },
    { label: "Digər", value: statsData?.otherCount || 0, color: "bg-[#EA4335]", lightColor: "bg-red-100" },
  ].map(item => ({
    ...item,
    percentage: statsData?.total ? Math.round((item.value / statsData.total) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  // Recent Docs formatted for generic Table
  const formattedRecentDocs = recentDocsData?.data?.map(doc => ({
    id: doc.id,
    title: doc.fileName,
    author: `${doc.uploadedBy?.firstName} ${doc.uploadedBy?.lastName}`,
    date: new Date(doc.uploadedAt).toLocaleString('az-AZ'),
    amount: doc.amount
  })) || [];

  const columns = [
    {
      title: 'Sənəd',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: 'Yükləyən',
      dataIndex: 'author',
      key: 'author',
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: 'Tarix',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <span className="text-gray-500 text-sm">{text}</span>,
    },
    {
      title: 'Məbləğ / Status',
      key: 'amount',
      render: (_: any, record: any) => (
        <Tag color={record.amount ? 'green' : 'default'}>
          {record.amount ? `${record.amount} AZN` : 'Məbləğ yoxdur'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/dashboard/docs/${record.id}`)}
          className="text-[#2271b1] p-0"
        >
          Bax
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section - Modern Header */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg md:shadow-lg p-5 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold mb-2">Xoş gəldiniz, Admin</h1>
            <p className="text-blue-100 text-xs md:text-sm">Sistemin ümumi vəziyyəti və son hərəkətlər burada görüntülənir</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/docs/new')}
              className="bg-white text-[#2271b1] px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm font-semibold md:shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer hover:bg-blue-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Sənəd
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Toplam Sənəd",
            value: statsData?.total || 0,
            trend: "Ümumi",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: "Toplam Məbləğ",
            value: `${statsData?.totalAmount || 0} ₼`,
            trend: "Cəmi",
            bgLight: "bg-emerald-50",
            textColor: "text-emerald-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Aktiv İstifadəçilər",
            value: statsData?.activeUsers || 0,
            trend: "Son 24 saat",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
          },
          {
            label: "Digər Sənədlər",
            value: statsData?.otherCount || 0,
            trend: "Formatlar",
            bgLight: "bg-amber-50",
            textColor: "text-amber-600",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 md:shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md hover:border-gray-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgLight} p-3 rounded-lg`}>
                <div className={stat.textColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-[10px] md:text-xs text-gray-400 mt-1">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Document Type Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 md:shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-900">Sənəd Növü Dağılımı</h3>
          </div>
          <div className="space-y-5">
            {documentTypeData.map((bar, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 text-xs md:text-sm">{bar.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] md:text-xs text-gray-500">{bar.value} sənəd</span>
                    <span className="font-bold text-gray-900 text-xs md:text-sm">{bar.percentage}%</span>
                  </div>
                </div>
                <div className={`h-3 w-full ${bar.lightColor} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${bar.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 md:shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Son Hərəkətlər</h3>
          {activities && activities.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200"></div>
              <div className="space-y-5 relative">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-4 items-start relative">
                    <div className={`w-6 h-6 rounded-full bg-blue-500 ring-4 ring-white z-10 shrink-0 flex items-center justify-center shadow-sm`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-xs md:text-sm text-gray-900">
                        <span className="font-semibold">{act.viewedBy?.firstName} {act.viewedBy?.lastName}</span>
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
                        '{act.document?.fileName}' sənədinə baxdı
                      </p>
                      <span className="text-[10px] md:text-xs text-gray-400 mt-1 block">
                        {new Date(act.viewedAt).toLocaleString('az-AZ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Hələ heç bir hərəkət yoxdur</p>
          )}
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-lg border border-gray-200 md:shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Son Yüklənən Sənədlər</h3>
          <button
            onClick={() => navigate('/dashboard/docs')}
            className="text-xs md:text-sm text-[#2271b1] font-semibold hover:text-[#135e96] cursor-pointer"
          >
            Hamısına bax →
          </button>
        </div>
        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={formattedRecentDocs}
            pagination={false}
            rowKey="id"
            size="middle"
            className="overflow-x-auto"
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {formattedRecentDocs.length > 0 ? (
            formattedRecentDocs.map((doc) => (
              <Card key={doc.id} className="shadow-none border border-gray-200" bodyStyle={{ padding: '16px' }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-base text-gray-900 break-all">{doc.title}</div>
                  <Tag color={doc.amount ? 'green' : 'default'} className="mr-0">
                    {doc.amount ? `${doc.amount} AZN` : '0 AZN'}
                  </Tag>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Yükləyən:</span>
                    <span className="font-medium">{doc.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tarix:</span>
                    <span>{doc.date}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/dashboard/docs/${doc.id}`)}
                    className="text-[#2271b1] p-0 h-auto text-sm font-medium"
                  >
                    Sənədə Bax →
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">Heç bir sənəd yoxdur</div>
          )}
        </div>
      </div>
    </div>
  );
}