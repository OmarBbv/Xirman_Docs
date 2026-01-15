import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForgotPassword, useVerifyResetOtp, useResetPassword } from "../hooks/authHooks";

type Props = {
  onNavigateToLogin: () => void;
};

export default function ForgotPassword({ onNavigateToLogin }: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forgotPasswordMutation = useForgotPassword();
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPasswordMutation.mutate(email, {
      onSuccess: () => setStep(2),
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    verifyResetOtpMutation.mutate(
      { email, code: otp },
      {
        onSuccess: () => setStep(3),
      }
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      // Should show error, relying on UI or toast
      return;
    }
    resetPasswordMutation.mutate(
      { email, code: otp, newPass: newPassword },
      {
        onSuccess: () => {
          onNavigateToLogin();
        },
      }
    );
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#202124] mb-2">
          {step === 1 && "Şifrəni unutmusunuz?"}
          {step === 2 && "OTP Kodu Təsdiqləyin"}
          {step === 3 && "Yeni Şifrə Təyin Edin"}
        </h2>
        <p className="text-[16px] text-[#202124]">
          {step === 1 && "Email ünvanınızı daxil edin"}
          {step === 2 && "Emailinizə göndərilən kodu daxil edin"}
          {step === 3 && "Yeni şifrənizi daxil edin"}
        </p>
      </div>

      {step === 1 && (
        <form className="space-y-6" onSubmit={handleSendOtp}>
          <Input
            type="email"
            placeholder="Email daxil edin"
            label="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="text-sm text-gray-500">
            Biz sizə şifrəni yeniləmək üçün link/kod göndərəcəyik.
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
            >
              Geri qayıt
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Göndərilir..." : "Kodu göndər"}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <Input
            type="text"
            placeholder="OTP Kodu"
            label="OTP Kod"
            className="w-full"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            autoFocus
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
            >
              Geri
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={verifyResetOtpMutation.isPending}
            >
              {verifyResetOtpMutation.isPending ? "Yoxlanılır..." : "Təsdiqlə"}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <Input
            type="password"
            placeholder="Yeni şifrə"
            label="Yeni Şifrə"
            className="w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder="Şifrəni təsdiqləyin"
            label="Təkrar Şifrə"
            className="w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {newPassword !== confirmPassword && confirmPassword && (
            <p className="text-red-500 text-sm">Şifrələr eyni deyil</p>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)} // Or disabled
              className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
            >
              Geri
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={resetPasswordMutation.isPending || (newPassword !== confirmPassword)}
            >
              {resetPasswordMutation.isPending ? "Yenilənir..." : "Yenilə"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
