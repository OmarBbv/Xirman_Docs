import { useEffect, useMemo, useState } from "react";
import {
  Table, Tag, Button, Modal, Form, Input, Select, Checkbox, Space,
  Dropdown, Spin, Card, Alert, Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined,
  SafetyCertificateOutlined, LockOutlined,
} from "@ant-design/icons";
import { useTranslations } from "use-intl";

import {
  useRoles, useRoleCatalog, useCreateRole, useUpdateRole, useDeleteRole,
} from "../hooks/roleHooks";
import type { Role } from "../services/roleService";

interface RoleFormValues {
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
  allowedDepartments?: string[];
  allowedDocumentTypes?: string[];
}
import { useAuth } from "../../context/AuthContext";

export default function RolesPage() {
  const t = useTranslations("RolesPage");
  const td = useTranslations("DocumentsPage");
  const { hasPermission, refreshUser } = useAuth();

  const canManage = hasPermission("roles.manage");

  const { data: roles, isLoading } = useRoles();
  const { data: catalog } = useRoleCatalog();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const permissionLabel = (key: string) => t(`permissions.${key.replace(".", "_")}` as never);

  const departmentOptions = useMemo(
    () => (catalog?.departments ?? []).map((value) => ({
      value,
      label: td(`departments.${value}` as never),
    })),
    [catalog, td]
  );

  const documentTypeOptions = useMemo(
    () => (catalog?.documentTypes ?? []).map((value) => ({
      value,
      label: td(`types.${value}` as never),
    })),
    [catalog, td]
  );

  useEffect(() => {
    if (!isModalOpen) return;
    form.setFieldsValue({
      name: editing?.name ?? "",
      displayName: editing?.displayName ?? "",
      description: editing?.description ?? "",
      permissions: editing?.permissions ?? [],
      allowedDepartments: editing?.allowedDepartments ?? [],
      allowedDocumentTypes: editing?.allowedDocumentTypes ?? [],
    });
  }, [isModalOpen, editing, form]);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSave = (values: RoleFormValues) => {
    const payload = {
      displayName: values.displayName,
      description: values.description || undefined,
      permissions: values.permissions ?? [],
      allowedDepartments: values.allowedDepartments ?? [],
      allowedDocumentTypes: values.allowedDocumentTypes ?? [],
    };

    const onSuccess = () => {
      closeModal();
      // Öz rolunu dəyişdirsə interfeys dərhal yenilənsin.
      void refreshUser();
    };

    if (editing) {
      updateRole.mutate({ id: editing.id, data: payload }, { onSuccess });
    } else {
      createRole.mutate({ ...payload, name: values.name }, { onSuccess });
    }
  };

  const confirmDelete = (role: Role) => {
    Modal.confirm({
      title: t("delete.title"),
      content: t("delete.confirm", { name: role.displayName }),
      okText: t("delete.yes"),
      cancelText: t("delete.no"),
      okButtonProps: { danger: true },
      onOk: () => deleteRole.mutateAsync(role.id),
    });
  };

  const scopeTags = (values: string[], labelOf: (value: string) => string) => {
    if (!values || values.length === 0) {
      return <Tag color="blue">{t("scope.all")}</Tag>;
    }
    return (
      <Space size={[4, 4]} wrap>
        {values.map((value) => (
          <Tag key={value}>{labelOf(value)}</Tag>
        ))}
      </Space>
    );
  };

  const columns: ColumnsType<Role> = [
    {
      title: t("columns.role"),
      key: "role",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {record.displayName}
            {record.isSystem && (
              <Tooltip title={t("systemRoleHint")}>
                <LockOutlined className="text-gray-400" />
              </Tooltip>
            )}
          </div>
          <div className="text-xs text-gray-500">{record.name}</div>
          {record.description && (
            <div className="text-xs text-gray-400 mt-0.5">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: t("columns.permissions"),
      key: "permissions",
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {record.permissions?.length ? (
            record.permissions.map((permission) => (
              <Tag key={permission} color="geekblue">{permissionLabel(permission)}</Tag>
            ))
          ) : (
            <span className="text-gray-400 text-xs">{t("scope.none")}</span>
          )}
        </Space>
      ),
    },
    {
      title: t("columns.departments"),
      key: "departments",
      render: (_, record) =>
        scopeTags(record.allowedDepartments, (value) => td(`departments.${value}` as never)),
    },
    {
      title: t("columns.documentTypes"),
      key: "documentTypes",
      render: (_, record) =>
        scopeTags(record.allowedDocumentTypes, (value) => td(`types.${value}` as never)),
    },
    {
      title: t("columns.users"),
      dataIndex: "userCount",
      key: "userCount",
      render: (count: number) => <Tag>{count ?? 0}</Tag>,
    },
    {
      title: t("columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          disabled={!canManage}
          menu={{
            items: [
              {
                key: "edit",
                label: t("actions.edit"),
                icon: <EditOutlined />,
                disabled: record.name === "admin",
                onClick: () => openEdit(record),
              },
              {
                key: "delete",
                label: t("actions.delete"),
                icon: <DeleteOutlined />,
                danger: true,
                disabled: record.isSystem,
                onClick: () => confirmDelete(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 20, transform: "rotate(90deg)" }} />}
            className="text-gray-500 hover:text-gray-700"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-[#2271b1] to-[#135e96] rounded-lg shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <SafetyCertificateOutlined /> {t("title")}
            </h1>
            <p className="text-blue-100 text-sm">{t("subtitle")}</p>
          </div>
          {canManage && (
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={openCreate}
              className="border-none bg-white text-[#2271b1] font-semibold h-10 shadow-md hover:!text-[#2271b1] hover:!bg-blue-50"
            >
              {t("newRole")}
            </Button>
          )}
        </div>
      </div>

      <Alert type="info" showIcon message={t("scopeHint")} />

      <div className="bg-white">
        {isLoading && !roles ? (
          <div className="flex justify-center items-center h-[300px]">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table
                columns={columns}
                dataSource={roles || []}
                rowKey="id"
                loading={isLoading}
                pagination={false}
                className="border border-gray-100 rounded-lg overflow-hidden"
                locale={{ emptyText: t("empty") }}
              />
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {(roles || []).map((role) => (
                <Card key={role.id} className="border border-gray-200" styles={{ body: { padding: 16 } }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{role.displayName}</div>
                      <div className="text-xs text-gray-500">{role.name}</div>
                    </div>
                    {canManage && (
                      <Space>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          disabled={role.name === "admin"}
                          onClick={() => openEdit(role)}
                        />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={role.isSystem}
                          onClick={() => confirmDelete(role)}
                        />
                      </Space>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("columns.permissions")}</div>
                      <Space size={[4, 4]} wrap>
                        {role.permissions?.map((permission) => (
                          <Tag key={permission} color="geekblue">{permissionLabel(permission)}</Tag>
                        ))}
                      </Space>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("columns.departments")}</div>
                      {scopeTags(role.allowedDepartments, (value) => td(`departments.${value}` as never))}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{t("columns.documentTypes")}</div>
                      {scopeTags(role.allowedDocumentTypes, (value) => td(`types.${value}` as never))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        title={editing ? `${t("actions.edit")} — ${editing.displayName}` : t("newRole")}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={760}
        centered
        destroyOnClose
        styles={{ body: { paddingBottom: 0 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="flex flex-col"
        >
          {/* Sahələr modalın içində sürüşür — düymələr həmişə görünən qalır. */}
          <div className="max-h-[calc(100vh-260px)] overflow-y-auto pt-4 pr-2 -mr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="displayName"
                label={t("form.displayName")}
                rules={[{ required: true, message: t("form.required") }]}
              >
                <Input placeholder={t("form.displayNamePlaceholder")} />
              </Form.Item>

              <Form.Item
                name="name"
                label={t("form.key")}
                tooltip={t("form.keyHint")}
                rules={[
                  { required: !editing, message: t("form.required") },
                  { pattern: /^[a-z0-9_]+$/, message: t("form.keyPattern") },
                ]}
              >
                <Input placeholder="anbardar" disabled={!!editing} />
              </Form.Item>
            </div>

            <Form.Item name="description" label={t("form.description")}>
              <Input.TextArea rows={2} placeholder={t("form.descriptionPlaceholder")} />
            </Form.Item>

            <Form.Item
              name="permissions"
              label={t("form.permissions")}
              rules={[{ required: true, message: t("form.permissionsRequired") }]}
            >
              <Checkbox.Group className="w-full">
                <div className="space-y-3 w-full">
                  {(catalog?.groups ?? []).map((group) => (
                    <div key={group.key} className="border border-gray-200 rounded p-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {t(`groups.${group.key}` as never)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {group.permissions.map((permission) => (
                          <Checkbox key={permission} value={permission}>
                            {permissionLabel(permission)}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="allowedDepartments"
                label={t("form.departments")}
                tooltip={t("form.emptyMeansAll")}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={t("scope.all")}
                  options={departmentOptions}
                />
              </Form.Item>

              <Form.Item
                name="allowedDocumentTypes"
                label={t("form.documentTypes")}
                tooltip={t("form.emptyMeansAll")}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder={t("scope.all")}
                  options={documentTypeOptions}
                />
              </Form.Item>
            </div>

          </div>

          <div className="flex justify-end gap-2 py-4 mt-2 border-t border-gray-100 bg-white">
            <Button onClick={closeModal}>{t("form.cancel")}</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createRole.isPending || updateRole.isPending}
              className="bg-[#2271b1]"
            >
              {editing ? t("form.save") : t("form.create")}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
