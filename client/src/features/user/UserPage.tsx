import { useState, useEffect } from "react";
import { Table, Tag, Space, Button, Dropdown, Modal, Avatar, Badge, Spin, Form, Input, Select, Card } from "antd";
import { Input as CustomInput } from "../ui/input";
import { useTranslations } from "use-intl";

import type { ColumnsType } from 'antd/es/table';
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from "../hooks/userHooks";
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
  MoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ClearOutlined
} from "@ant-design/icons";

export default function UserPage() {
  const t = useTranslations("UserPage");
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const { data: users, isLoading } = useUsers(debouncedSearchText, roleFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();

  const handleSaveUser = (values: any) => {
    if (editingId) {
      if (!values.password) {
        delete values.password;
      }
      updateUser.mutate({ id: editingId, data: values }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }
      });
    } else {
      createUser.mutate(values, {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        }
      });
    }
  };

  const handleEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      role: record.role,
      position: record.position,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const verifiedCount = users?.filter(u => u.isVerified).length || 0;

  const columns: ColumnsType<User> = [
    {
      title: t("columns.user"),
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
      title: t("columns.position"),
      dataIndex: 'position',
      key: 'position',
      render: (text) => <span className="text-gray-700">{text ? t(`positions.${text}`) : '-'}</span>,
    },
    {
      title: t("columns.role"),
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'default';
        if (role === 'admin') color = 'purple';
        if (role === 'editor') color = 'blue';
        if (role === 'user') color = 'green';

        return (
          <Tag color={color} className="capitalize rounded-full px-2.5">
            {t(`roles.${role}`)}
          </Tag>
        );
      },
    },
    {
      title: t("columns.status"),
      dataIndex: 'isVerified',
      key: 'status',
      render: (verified) => (
        <Badge
          status={verified ? "success" : "default"}
          text={verified ? t("status.verified") : t("status.unverified")}
          className="bg-gray-50 px-2 py-0.5 rounded-full text-xs border border-gray-200"
        />
      ),
    },
    {
      title: t("columns.actions"),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                label: t("actions.edit"),
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                label: t("actions.delete"),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: t("actions.deleteTitle"),
                    content: t("actions.deleteConfirm"),
                    okText: t("actions.yes"),
                    cancelText: t("actions.no"),
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



  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-blue-100 text-sm">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="default"
              icon={<UserAddOutlined />}
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
              className="border-none bg-white text-[#2271b1] font-semibold h-10 shadow-md hover:!text-[#2271b1] hover:!bg-blue-50"
            >
              {t("newUser")}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("totalUsers"), value: totalUsers, icon: <TeamOutlined />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: t("admins"), value: adminCount, icon: <SafetyCertificateOutlined />, color: "text-purple-600", bg: "bg-purple-50" },
          { label: t("activeAccounts"), value: verifiedCount, icon: <CheckCircleOutlined />, color: "text-green-600", bg: "bg-green-50" },
          { label: t("deactiveAccounts"), value: totalUsers - verifiedCount, icon: <CloseCircleOutlined />, color: "text-gray-500", bg: "bg-gray-100" },
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

      <div className="bg-white p-6 md:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <Input
              placeholder={t("searchPlaceholder")}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="max-w-md h-10"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder={t("roleFilter")}
              allowClear
              className="w-full md:w-40 h-10"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'admin', label: t("roles.admin") },
                { value: 'user', label: t("roles.user") },
                { value: 'editor', label: t("roles.editor") },
              ]}
            />
            {(searchText || roleFilter) && (
              <Button
                icon={<ClearOutlined />}
                className="h-10 w-full md:w-auto"
                onClick={() => {
                  setSearchText("");
                  setRoleFilter(null);
                }}
              >
                {t("clear")}
              </Button>
            )}
          </div>
        </div>

        {isLoading && !users ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table
                columns={columns}
                dataSource={users || []}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                locale={{ emptyText: 'İstifadəçi tapılmadı' }}
                className="border border-gray-100 rounded-lg overflow-hidden"
              />
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {(users?.length || 0) > 0 ? (
                users?.map((user) => {
                  let roleColor = 'default';
                  if (user.role === 'admin') roleColor = 'purple';
                  if (user.role === 'editor') roleColor = 'blue';
                  if (user.role === 'user') roleColor = 'green';

                  return (
                    <Card key={user.id} className="shadow-none border border-gray-200" styles={{ body: { padding: '16px' } }}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar style={{ backgroundColor: '#2271b1' }} icon={<UserOutlined />} />
                          <div>
                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <Tag color={roleColor} className="capitalize rounded-full px-2 text-xs m-0">
                              {t(`roles.${user.role}`)}
                            </Tag>
                          </div>
                        </div>
                        <Dropdown
                          trigger={['click']}
                          menu={{
                            items: [
                              {
                                key: 'edit',
                                label: t("actions.edit"),
                                icon: <EditOutlined />,
                                onClick: () => handleEdit(user),
                              },
                              {
                                key: 'delete',
                                label: t("actions.delete"),
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: (e) => {
                                  e.domEvent.stopPropagation();
                                  Modal.confirm({
                                    title: t("actions.deleteTitle"),
                                    content: t("actions.deleteConfirm"),
                                    okText: t("actions.yes"),
                                    cancelText: t("actions.no"),
                                    okButtonProps: { danger: true },
                                    onOk: () => deleteUser.mutate(user.id),
                                  });
                                },
                              },
                            ],
                          }}
                        >
                          <Button
                            type="text"
                            icon={<MoreOutlined style={{ fontSize: '20px', transform: 'rotate(90deg)' }} />}
                            className="text-gray-500 hover:text-gray-700 -mr-2 -mt-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-3 pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t("form.email")}:</span>
                          <span className="font-medium text-gray-800">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t("columns.position")}:</span>
                          <span className="font-medium text-gray-800 capitalize">{user.position ? t(`positions.${user.position}`) : '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">{t("columns.status")}:</span>
                          <Badge
                            status={user.isVerified ? "success" : "default"}
                            text={user.isVerified ? t("status.verified") : t("status.unverified")}
                            className="bg-gray-50 px-2 py-0.5 rounded-full text-xs border border-gray-200"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">
                  {t("notFound")}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Modal
        title={editingId ? t("actions.edit") : t("newUser")}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
          className="pt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              className="select-none"
              rules={[{ required: true, message: `${t("form.firstName")} ${t("form.required")}` }]}
            >
              <CustomInput label={t("form.firstName")} />
            </Form.Item>
            <Form.Item
              name="lastName"
              className="select-none"
              rules={[{ required: true, message: `${t("form.lastName")} ${t("form.required")}` }]}
            >
              <CustomInput label={t("form.lastName")} />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: `${t("form.email")} ${t("form.required")}` },
              { type: 'email', message: t("form.validEmail") }
            ]}
          >
            <CustomInput label={t("form.email")} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: !editingId, message: `${t("form.password")} ${t("form.required")}` }]}
          >
            <CustomInput
              label={editingId ? t("form.passwordEdit") : t("form.password")}
              type={showPassword ? "text" : "password"}
              suffix={
                <div onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
              }
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label={t("form.role")}
              rules={[{ required: true, message: `${t("form.role")} ${t("form.selectRequired")}` }]}
              initialValue="user"
            >
              <Select
                className="h-[55px] [&_.ant-select-selector]:h-full! [&_.ant-select-selector]:flex! [&_.ant-select-selector]:items-center!"
              >
                <Select.Option value="admin">{t("roles.admin")}</Select.Option>
                <Select.Option value="editor">{t("roles.editor")}</Select.Option>
                <Select.Option value="user">{t("roles.user")}</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="position"
              label={t("form.position")}
              rules={[{ required: true, message: `${t("form.position")} ${t("form.selectRequired")}` }]}
            >
              <Select
                placeholder={t("form.selectRequired")}
                className="h-[55px] [&_.ant-select-selector]:h-full! [&_.ant-select-selector]:flex! [&_.ant-select-selector]:items-center!"
              >
                <Select.Option value="director">{t("positions.director")}</Select.Option>
                <Select.Option value="finance_manager">{t("positions.finance_manager")}</Select.Option>
                <Select.Option value="accountant">{t("positions.accountant")}</Select.Option>
                <Select.Option value="sales_specialist">{t("positions.sales_specialist")}</Select.Option>
                <Select.Option value="warehouseman">{t("positions.warehouseman")}</Select.Option>
                <Select.Option value="hr">{t("positions.hr")}</Select.Option>
                <Select.Option value="manager">{t("positions.manager")}</Select.Option>
                <Select.Option value="employee">{t("positions.employee")}</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>
              {t("form.cancel")}
            </Button>
            <Button type="primary" htmlType="submit" loading={editingId ? updateUser.isPending : createUser.isPending} className="bg-[#2271b1]">
              {editingId ? t("form.save") : t("form.create")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}