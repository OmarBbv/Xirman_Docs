import { PRIVATE_API } from "../utils/apiConfig";

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  allowedDepartments: string[];
  allowedDocumentTypes: string[];
  isSystem: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCatalog {
  permissions: string[];
  groups: { key: string; permissions: string[] }[];
  departments: string[];
  documentTypes: string[];
}

export interface RolePayload {
  name?: string;
  displayName: string;
  description?: string;
  permissions: string[];
  allowedDepartments: string[];
  allowedDocumentTypes: string[];
}

class RoleService {
  async getAll(): Promise<Role[]> {
    const response = await PRIVATE_API.get("/roles");
    return response.data;
  }

  async getCatalog(): Promise<RoleCatalog> {
    const response = await PRIVATE_API.get("/roles/catalog");
    return response.data;
  }

  async create(data: RolePayload): Promise<Role> {
    const response = await PRIVATE_API.post("/roles", data);
    return response.data;
  }

  async update(id: number, data: Omit<RolePayload, "name">): Promise<Role> {
    const response = await PRIVATE_API.patch(`/roles/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await PRIVATE_API.delete(`/roles/${id}`);
  }
}

export const roleService = new RoleService();
