import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, useVerifyOtp } from "../hooks/authHooks";

const registerSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 simvoldan ibarət olmalıdır"),
  lastName: z.string().min(2, "Soyad ən azı 2 simvoldan ibarət olmalıdır"),
  email: z.string().email("Düzgün email daxil edin"),
  position: z.string().min(1, "Vəzifə seçilməlidir"),
  password: z.string().min(6, "Şifrə ən azı 6 simvoldan ibarət olmalıdır"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifrələr uyğun gəlmir",
  path: ["confirmPassword"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

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
          <h2 className="text-2xl font-semibold text-[#202124] mb-2">Təsdiqləmə</h2>
          <p className="text-[16px] text-[#202124]">
            {userEmail} ünvanına göndərilən 6 rəqəmli kodu daxil edin
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
              {isVerifyPending ? "Yoxlanılır..." : "Təsdiqlə"}
            </Button>

            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-[#5f6368] text-sm hover:underline cursor-pointer"
            >
              Geri qayıt və məlumatları düzəlt
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#202124] mb-2">Qeydiyyat</h2>
        <p className="text-[16px] text-[#202124]">Yeni hesab yaradın</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onRegisterSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ad"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Soyad"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          type="email"
          label="Email"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="relative">
          <label className={`text-[12px] ${errors.position ? 'text-red-500' : 'text-[#1a73e8]'} bg-white px-1 absolute -top-2.5 left-3 z-10`}>
            Vəzifə
          </label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Vəzifə seçin"
                className={`w-full h-[54px] ant-select-custom ${errors.position ? 'ant-select-status-error' : ''}`}
                options={[
                  { value: '', label: 'Vəzifə seçin', disabled: true },
                  { value: 'finance_manager', label: 'Maliyyə müdiri' },
                  { value: 'accountant', label: 'Mühasib' },
                  { value: 'sales_specialist', label: 'Satış mütəxəssisi' },
                  { value: 'warehouseman', label: 'Anbardar' },
                  { value: 'director', label: 'Direktor' },
                  { value: 'hr', label: 'HR' },
                ]}
                status={errors.position ? "error" : ""}
                style={{ width: '100%' }}
              />
            )}
          />
          {errors.position && <p className="text-red-500 text-[12px] mt-1 ml-1">{errors.position.message}</p>}
        </div>

        <Input
          type="password"
          label="Şifrə"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          type="password"
          label="Şifrəni təsdiqlə"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:underline cursor-pointer"
          >
            Artıq hesabınız var?
          </button>
          <Button type="submit" className="py-1.5 px-6 w-fit" disabled={isRegisterPending}>
            {isRegisterPending ? "Gözləyin..." : "Qeydiyyatdan keç"}
          </Button>
        </div>
      </form>
    </div>
  );
}