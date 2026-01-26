import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, useVerifyOtp } from "../hooks/authHooks";
import { useTranslations } from "use-intl";

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('RegisterPage');
  const tErrors = useTranslations('RegisterPage.errors');
  const tPositions = useTranslations('RegisterPage.positions');

  const registerSchema = z.object({
    firstName: z.string().min(2, tErrors('firstNameMin')),
    lastName: z.string().min(2, tErrors('lastNameMin')),
    email: z.string().email(tErrors('emailInvalid')),
    position: z.string().min(1, tErrors('positionRequired')),
    password: z.string().min(6, tErrors('passwordMin')),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: tErrors('passwordMismatch'),
    path: ["confirmPassword"],
  });

  type RegisterSchema = z.infer<typeof registerSchema>;

  const { mutate: registerUser, isPending: isRegisterPending } = useRegister();
  const { mutate: verifyOtp, isPending: isVerifyPending } = useVerifyOtp();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      position: "",
    },
  });

  const onRegisterSubmit = (data: RegisterSchema) => {
    registerUser(data, {
      onSuccess: () => {
        setUserEmail(data.email);
        setStep("verify");
      },
    });
  };

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      verifyOtp({ email: userEmail, code: otpCode });
    }
  };

  if (step === "verify") {
    return (
      <div className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#202124] mb-2">{t('verifyTitle')}</h2>
          <p className="text-[16px] text-[#202124]">
            {t('verifySubtitle', { email: userEmail })}
          </p>
        </div>

        <form className="space-y-6" onSubmit={onVerifySubmit}>
          <div className="flex justify-center">
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full max-w-[200px] text-center text-3xl tracking-[10px] font-bold py-3 border-b-2 border-[#1a73e8] focus:outline-none bg-transparent"
              autoFocus
            />
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <Button
              type="submit"
              className="py-2.5 px-8 w-full md:w-fit"
              disabled={isVerifyPending || otpCode.length !== 6}
            >
              {isVerifyPending ? t('verifying') : t('verify')}
            </Button>

            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-[#5f6368] text-sm hover:underline cursor-pointer"
            >
              {t('backToEdit')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#202124] mb-2">{t('title')}</h2>
        <p className="text-[16px] text-[#202124]">{t('subtitle')}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onRegisterSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('firstName')}
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label={t('lastName')}
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          type="email"
          label={t('email')}
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="relative">
          <label className={`text-[12px] ${errors.position ? 'text-red-500' : 'text-[#1a73e8]'} bg-white px-1 absolute -top-2.5 left-3 z-10`}>
            {t('position')}
          </label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder={t('positionPlaceholder')}
                className={`w-full h-[54px] ant-select-custom ${errors.position ? 'ant-select-status-error' : ''}`}
                options={[
                  { value: '', label: t('positionPlaceholder'), disabled: true },
                  { value: 'finance_manager', label: tPositions('finance_manager') },
                  { value: 'accountant', label: tPositions('accountant') },
                  { value: 'sales_specialist', label: tPositions('sales_specialist') },
                  { value: 'sales_manager', label: tPositions('sales_manager') },
                  { value: 'warehouseman', label: tPositions('warehouseman') },
                  { value: 'director', label: tPositions('director') },
                  { value: 'hr', label: tPositions('hr') },
                ]}
                status={errors.position ? "error" : ""}
                style={{ width: '100%' }}
              />
            )}
          />
          {errors.position && <p className="text-red-500 text-[12px] mt-1 ml-1">{errors.position.message}</p>}
        </div>

        <Input
          type={showPassword ? "text" : "password"}
          label={t('password')}
          {...register("password")}
          error={errors.password?.message}
          suffix={
            <div onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </div>
          }
        />
        <Input
          type={showPassword ? "text" : "password"}
          label={t('confirmPassword')}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          suffix={
            <div onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </div>
          }
        />

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:underline cursor-pointer"
          >
            {t('alreadyHaveAccount')}
          </button>
          <Button type="submit" className="py-1.5 px-6 w-fit" disabled={isRegisterPending}>
            {isRegisterPending ? t('registering') : t('register')}
          </Button>
        </div>
      </form>
    </div>
  );
}