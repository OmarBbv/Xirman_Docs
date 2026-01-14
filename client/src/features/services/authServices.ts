import { PUBLIC_API } from "../utils/apiConfig";

interface AuthServiceTypes {
  login(email: string, password: string): Promise<any>;
  register(firstName: string, lastName: string, password: string, email: string, position: string): Promise<any>;
  verifyOtp(email: string, code: string): Promise<any>;
}

class AuthService implements AuthServiceTypes {
  async login(email: string, password: string): Promise<any> {
    try {
      const response = await PUBLIC_API.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async register(firstName: string, lastName: string, password: string, email: string, position: string): Promise<any> {
    try {
      const response = await PUBLIC_API.post("/auth/register", { firstName, lastName, password, email, position });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  async verifyOtp(email: string, code: string): Promise<any> {
    try {
      const response = await PUBLIC_API.post("/auth/verify-otp", { email, code });
      return response.data;
    } catch (error) {
      throw this.errorHandler(error);
    }
  }

  errorHandler(error: any): Error {
    const message = error.response?.data?.message || error.message || "Xəta baş verdi";
    console.error("Auth Error:", message);
    return new Error(message);
  }
}

export const authService = new AuthService();