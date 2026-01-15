import { useState } from "react";
import { Table, Tag, Space, Button, Input, Select, Dropdown, Modal, Avatar, Badge, Spin } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { useUsers, useDeleteUser } from "../hooks/userHooks";
import type { User } from "../services/userService";
import {
  UserOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  UserAddOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined
} from "@ant-design/icons";

export default function UserPage() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Filter logic
  const filteredUsers = users?.filter(user => {
    const matchesSearch =
      (user.firstName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchText.toLowerCase());

    const matchesRole = roleFilter ? user.role === roleFilter : true;

    return matchesSearch && matchesRole;
  }) || [];

  // Stats calculation
  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const verifiedCount = users?.filter(u => u.isVerified).length || 0;

  const columns: ColumnsType<User> = [
    {
      title: 'İstifadəçi',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#2271b1' }} icon={<UserOutlined />} />
          <div>
            <div className="font-medium text-gray-900">{record.firstName} {record.lastName}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vəzifə',
      dataIndex: 'position',
      key: 'position',
      render: (text) => <span className="text-gray-700">{text || '-'}</span>,
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'default';
        if (role === 'admin') color = 'purple';
        if (role === 'editor') color = 'blue';
        if (role === 'user') color = 'green';

        return (
          <Tag color={color} className="capitalize rounded-full px-2.5">
            {role}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      render: (verified) => (
        <Badge
          status={verified ? "success" : "default"}
          text={verified ? "Təsdiqlənib" : "Təsdiqlənməyib"}
          className="bg-gray-50 px-2 py-0.5 rounded-full text-xs border border-gray-200"
        />
      ),
    },
    {
      title: 'Əməliyyatlar',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzəliş et',
                icon: <EditOutlined />,
                onClick: () => { },
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'İstifadəçini sil',
                    content: 'Bu istifadəçini silmək istədiyinizə əminsiniz?',
                    okText: 'Bəli',
                    cancelText: 'Xeyr',
                    okButtonProps: { danger: true },
                    onOk: () => deleteUser.mutate(record.id),
                  });
                },
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: '20px', transform: 'rotate(90deg)' }} />}
            className="text-gray-500 hover:text-gray-700"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown >
      ),

    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">İstifadəçi İdarəetməsi</h1>
            <p className="text-blue-100 text-sm">Sistemdəki bütün istifadəçiləri və onların rollarını idarə edin</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="default"
              icon={<UserAddOutlined />}
              className="border-none bg-white text-[#2271b1] font-semibold h-10 shadow-md hover:!text-[#2271b1] hover:!bg-blue-50"
            >
              Yeni İstifadəçi
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Toplam İstifadəçi", value: totalUsers, icon: <TeamOutlined />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Adminlər", value: adminCount, icon: <SafetyCertificateOutlined />, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Aktiv Hesablar", value: verifiedCount, icon: <CheckCircleOutlined />, color: "text-green-600", bg: "bg-green-50" },
          { label: "Deaktiv Hesablar", value: totalUsers - verifiedCount, icon: <CloseCircleOutlined />, color: "text-gray-500", bg: "bg-gray-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className={`${stat.bg} p-3 rounded-lg ${stat.color} text-xl`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <Input
              placeholder="İstifadəçi axtar (Ad, Email)..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="max-w-md h-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Rol filtr"
              allowClear
              className="w-40 h-10"
              onChange={setRoleFilter}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'editor', label: 'Editor' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: 'İstifadəçi tapılmadı' }}
          className="border border-gray-100 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}