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
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/dashboard/docs", { replace: true });
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
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/dashboard/docs", { replace: true });
        }
      }
    },
    onError: (error: any) => {
      message.error(error.message || "OTP təsdiqlənmədi");
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data: any) => {
      message.success(data.message || "OTP kodu göndərildi");
    },
    onError: (error: any) => {
      message.error(error.message || "Xəta baş verdi");
    }
  });
};

export const useVerifyResetOtp = () => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.verifyResetOtp(email, code),
    onSuccess: () => {
      message.success("OTP kodu təsdiqləndi");
    },
    onError: (error: any) => {
      message.error(error.message || "Yanlış OTP kodu");
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, code, newPass }: { email: string; code: string; newPass: string }) =>
      authService.resetPassword(email, code, newPass),
    onSuccess: (data: any) => {
      message.success(data.message || "Şifrə uğurla yeniləndi");
    },
    onError: (error: any) => {
      message.error(error.message || "Şifrə yenilənməsi zamanı xəta");
    }
  });
};