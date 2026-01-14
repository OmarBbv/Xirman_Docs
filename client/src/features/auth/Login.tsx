import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Register from "./Register";
import { useLogin } from "../hooks/authHooks";

type AuthView = "login" | "register" | "forgot-password";

export default function Login() {
  const [view, setView] = useState<AuthView>("login");
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forgot password submitted");
    // Show success message or back to login
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans overflow-hidden">
      <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-lg p-10 shadow-sm relative min-h-[500px]">
        <div className="flex justify-center mb-8">
          <div className="text-[28px] font-bold tracking-tight text-[#4285F4]">
            Xirman<span className="text-[#34A853]">DMS</span>
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
                  <h2 className="text-2xl font-semibold text-[#202124] mb-2">Daxil olun</h2>
                  <p className="text-[16px] text-[#202124]">Xirman İdarəetmə Sisteminə girişi</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email daxil edin"
                    label="Email"
                    className="w-full"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Şifrəni daxil edin"
                    label="Şifrə"
                    className="w-full"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => changeView("forgot-password")}
                      className="font-medium text-[#1a73e8] p-1 -ml-1 rounded transition-colors inline-block hover:underline cursor-pointer"
                    >
                      Şifrəni unutmusunuz?
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => changeView("register")}
                      className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:underline cursor-pointer"
                    >
                      Hesab yaradın
                    </button>
                    <Button
                      type="submit"
                      className="py-1.5 px-6 w-fit"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Giriş edilir..." : "Daxil ol"}
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
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-[#202124] mb-2">Şifrəni unutmusunuz?</h2>
                  <p className="text-[16px] text-[#202124]">Email ünvanınızı daxil edin</p>
                </div>

                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <Input type="email" placeholder="Email" label="Email" className="w-full" />

                  <div className="text-sm text-gray-500">
                    Biz sizə şifrəni yeniləmək üçün link göndərəcəyik.
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => changeView("login")}
                      className="text-[#1a73e8] font-medium text-sm py-2 rounded transition-colors hover:bg-blue-50 px-2"
                    >
                      Geri qayıt
                    </button>
                    <Button type="submit" className="py-1.5 px-6 w-fit">
                      Linki göndər
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer helpers */}
      <div className="absolute bottom-6 w-full max-w-[450px] flex justify-between text-[12px] text-[#70757a]">
        <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">Azərbaycan dili</div>
        <div className="space-x-4">
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Kömək</a>
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Məxfilik</a>
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Şərtlər</a>
        </div>
      </div>
    </div>
  );
}
