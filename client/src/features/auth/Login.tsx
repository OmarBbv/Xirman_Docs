import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function Login() {

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans">
      <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-lg p-10 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="text-[28px] font-bold tracking-tight text-[#4285F4]">
            Xirman<span className="text-[#34A853]">DMS</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[16px] text-[#202124]">Xirman İdarəetmə Sisteminə daxil olun</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <Input type="email" placeholder="Email or phone" label="Email or phone" />
          <Input type="password" placeholder="Enter your password" label="Enter your password" />

          <div className="text-sm">
            <a href="#" className="font-medium text-[#1a73e8]  p-1 -ml-1 rounded transition-colors inline-block">
              Forgot email?
            </a>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/register"
              className="text-[#1a73e8] font-medium text-sm  py-2 rounded transition-colors"
            >
              Create account
            </Link>
            <Button type="submit" className="py-1.5 px-6  w-fit">
              Next
            </Button>
          </div>
        </form>
      </div>

      {/* Footer helpers */}
      <div className="absolute bottom-6 w-full max-w-[450px] flex justify-between text-[12px] text-[#70757a]">
        <div className="cursor-pointer hover:bg-gray-100 p-1 rounded">English (United States)</div>
        <div className="space-x-4">
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Help</a>
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Privacy</a>
          <a href="#" className="hover:bg-gray-100 p-1 rounded">Terms</a>
        </div>
      </div>
    </div>
  );
}
