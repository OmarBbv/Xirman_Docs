import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../../context/AuthContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: any) => authService.login(email, password),
    onSuccess: (data: any) => {
      if (data.access_token) {
        login(data.user, data.access_token);
        if (data.user.role === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/dashboard/docs");
        }
      }
    },
    onError: (error: any) => {
      message.error(error.message || "Giriş zamanı xəta baş verdi");
    }
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: any) => authService.register(
      data.firstName,
      data.lastName,
      data.password,
      data.email,
      data.position
    ),
    onSuccess: (data: any) => {
      message.success(data.message || "OTP kodu göndərildi");
    },
    onError: (error: any) => {
      message.error(error.message || "Qeydiyyat zamanı xəta baş verdi");
    }
  });
};

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.verifyOtp(email, code),
    onSuccess: (data: any) => {
      if (data.access_token) {
        login(data.user, data.access_token);
        message.success("Qeydiyyat tamamlandı!");
        if (data.user.role === 'admin') {
          navigate("/dashboard");
        } else {
          navigate("/dashboard/docs");
        }
      }
    },
    onError: (error: any) => {
      message.error(error.message || "OTP təsdiqlənmədi");
    }
  });
};