import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForgotPassword, useVerifyResetOtp, useResetPassword } from "../hooks/authHooks";
import { EyeIcon, EyeOffIcon } from "../ui/Icons";
import { useTranslations } from "use-intl";

type Props = {
  onNavigateToLogin: () => void;
};

export default function ForgotPassword({ onNavigateToLogin }: Props) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const forgotPasswordMutation = useForgotPassword();
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();
  const t = useTranslations('ForgotPasswordPage');

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
          {step === 1 && t('step1Title')}
          {step === 2 && t('step2Title')}
          {step === 3 && t('step3Title')}
        </h2>
        <p className="text-[16px] text-[#202124]">
          {step === 1 && t('step1Subtitle')}
          {step === 2 && t('step2Subtitle')}
          {step === 3 && t('step3Subtitle')}
        </p>
      </div>

      {step === 1 && (
        <form className="space-y-6" onSubmit={handleSendOtp}>
          <Input
            type="email"
            placeholder={t('emailPlaceholder')}
            label={t('email')}
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="text-sm text-gray-500">
            {t('info')}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
            >
              {t('back')}
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? t('sending') : t('sendCode')}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <Input
            type="text"
            placeholder={t('otpCodePlaceholder')}
            label={t('otpCode')}
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
              {t('backShort')}
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={verifyResetOtpMutation.isPending}
            >
              {verifyResetOtpMutation.isPending ? t('verifying') : t('verify')}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t('newPasswordPlaceholder')}
            label={t('newPassword')}
            className="w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t('confirmPasswordPlaceholder')}
            label={t('confirmPassword')}
            className="w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          {newPassword !== confirmPassword && confirmPassword && (
            <p className="text-red-500 text-sm">{t('passwordMismatch')}</p>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
            >
              {t('backShort')}
            </button>
            <Button
              type="submit"
              className="py-1.5 px-6 w-fit"
              disabled={resetPasswordMutation.isPending || (newPassword !== confirmPassword)}
            >
              {resetPasswordMutation.isPending ? t('resetting') : t('reset')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
