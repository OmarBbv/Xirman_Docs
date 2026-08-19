/**
 * Sistemdəki bütün icazələr. Admin rol yaradarkən bu siyahıdan seçir.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_VIEW_ALL: 'documents.view_all',
  DOCUMENTS_CREATE: 'documents.create',
  DOCUMENTS_UPDATE: 'documents.update',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_DOWNLOAD: 'documents.download',

  NOTIFICATIONS_VIEW: 'notifications.view',
  SETTINGS_VIEW: 'settings.view',

  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: string[] = Object.values(PERMISSIONS);

/** Frontend-də icazə seçim ekranını qruplaşdırmaq üçün. */
export const PERMISSION_GROUPS: {
  key: string;
  permissions: string[];
}[] = [
  { key: 'dashboard', permissions: [PERMISSIONS.DASHBOARD_VIEW] },
  {
    key: 'documents',
    permissions: [
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.DOCUMENTS_VIEW_ALL,
      PERMISSIONS.DOCUMENTS_CREATE,
      PERMISSIONS.DOCUMENTS_UPDATE,
      PERMISSIONS.DOCUMENTS_DELETE,
      PERMISSIONS.DOCUMENTS_DOWNLOAD,
    ],
  },
  {
    key: 'general',
    permissions: [PERMISSIONS.NOTIFICATIONS_VIEW, PERMISSIONS.SETTINGS_VIEW],
  },
  { key: 'users', permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE] },
  { key: 'roles', permissions: [PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE] },
];

/** Sistem tərəfindən yaradılan, silinməsi mümkün olmayan rollar. */
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
