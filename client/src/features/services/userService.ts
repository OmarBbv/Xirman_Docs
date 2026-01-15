import { PRIVATE_API } from "../utils/apiConfig";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role: string;
  isVerified: boolean;
}

class UserService {
  async getAll(search?: string, role?: string | null): Promise<User[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const response = await PRIVATE_API.get(`/users?${params.toString()}`);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await PRIVATE_API.delete(`/users/${id}`);
  }

  async update(id: number, data: any): Promise<void> {
    await PRIVATE_API.patch(`/users/${id}`, data);
  }

  async create(data: any): Promise<void> {
    await PRIVATE_API.post("/users/admin", data);
  }
}

export const userService = new UserService();
