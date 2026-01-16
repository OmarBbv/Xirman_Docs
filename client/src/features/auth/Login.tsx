import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import { useLogin } from "../hooks/authHooks";
import { EyeIcon, EyeOffIcon } from "../ui/Icons";
import { useTranslations } from "use-intl";
import { useLanguage } from "../../context/LanguageContext";

type AuthView = "login" | "register" | "forgot-password";

export default function Login() {
  const [view, setView] = useState<AuthView>("login");
  const loginMutation = useLogin();
  const t = useTranslations('LoginPage');
  const { locale, setLocale } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const changeView = (newView: AuthView) => {
    const newPage = newView === "login" ? 0 : newView === "register" ? 1 : 2;
    const dir = newPage > page ? 1 : -1;
    setPage([newPage, dir]);
    setView(newView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-sans">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setLocale('az')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${locale === 'az'
              ? 'bg-[#4285F4] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            🇦🇿 AZ
          </button>
          <button
            onClick={() => setLocale('ru')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${locale === 'ru'
              ? 'bg-[#4285F4] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            🇷🇺 RU
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-lg p-10 shadow-sm relative min-h-[400px]">
          <div className="flex justify-center mb-2">
            <div className="text-[28px] font-bold tracking-tight text-[#4285F4]">
              {locale === 'ru' ? (
                <>Хирман<span className="text-[#34A853]">ЭАС</span></>
              ) : (
                <>Xirman<span className="text-[#34A853]">EAS</span></>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden h-full -mx-4 px-4 -my-2 py-4">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {view === "login" && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-[#202124] mb-2">{t('title')}</h2>
                    <p className="text-[16px] text-[#202124]">{t('subtitle')}</p>
                  </div>

                  <form className="space-y-6" onSubmit={handleLogin}>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t('emailPlaceholder')}
                      label={t('email')}
                      className="w-full"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder={t('passwordPlaceholder')}
                      label={t('password')}
                      className="w-full"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
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

                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => changeView("forgot-password")}
                        className="font-medium text-[#1a73e8] p-1 -ml-1 rounded transition-colors inline-block hover:underline cursor-pointer"
                      >
                        {t('forgotPassword')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => changeView("register")}
                        className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:underline cursor-pointer"
                      >
                        {t('createAccount')}
                      </button>
                      <Button
                        type="submit"
                        className="py-1.5 px-6 w-fit"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t('loggingIn') : t('login')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {view === "register" && (
                <motion.div
                  key="register"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full"
                >
                  <Register onNavigateToLogin={() => changeView("login")} />
                </motion.div>
              )}

              {view === "forgot-password" && (
                <motion.div
                  key="forgot-password"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full"
                >
                  <ForgotPassword onNavigateToLogin={() => changeView("login")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center py-6">
        <div className="w-full max-w-[450px] flex justify-between text-[12px] text-[#70757a] px-4">
          <div className="space-x-4">
            <a href="#" className="hover:bg-gray-100 p-1 rounded">{t('help')}</a>
            <a href="#" className="hover:bg-gray-100 p-1 rounded">{t('privacy')}</a>
            <a href="#" className="hover:bg-gray-100 p-1 rounded">{t('terms')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
