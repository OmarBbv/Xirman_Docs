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
  async getAll(): Promise<User[]> {
    const response = await PRIVATE_API.get("/users");
    // API birbaşa array qaytarırsa response.data, əgər { data: [...] } qaytarırsa ona uyğun
    // NestJS default olaraq array qaytarır findAll-da (service-dən asılıdır)
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await PRIVATE_API.delete(`/users/${id}`);
  }

  async update(id: number, data: any): Promise<void> {
    await PRIVATE_API.patch(`/users/${id}`, data);
  }
}

export const userService = new UserService();
