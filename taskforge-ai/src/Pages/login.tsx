// LoginCardUI.tsx
import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { LoginPerson } from "../Service/Api_Calls/AuthService"; 
import { toast } from "sonner";
import { useSocket } from "../Utils/hooks/useSocket";
function stripBearer(token: string) {
  return token.startsWith("Bearer ") ? token.slice(7) : token;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

const LoginCardUI: React.FC = () => {
  const stored = localStorage.getItem("Token");
  const rawJwt = stored ? stripBearer(stored) : null;
  const decoded = rawJwt ? parseJwt(rawJwt) : null;
  const now = Date.now() / 1000;
  if (decoded && typeof decoded.exp === "number" && decoded.exp > now) {
    return <Navigate to="/dashboard" replace />;
  }
  const {initSocket}=useSocket()
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [touched, setTouched] = useState({ name: false, password: false });
  const navigate = useNavigate();
  const errors = useMemo(() => {
    const e = { name: "", password: "" };
    if (!name.trim()) e.name = "Username is required";
    else if (name.trim().length < 3) e.name = "Username must be at least 3 characters";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  }, [name, password]);
  const hasErrors = !!(errors.name || errors.password);
  const requestPreview = useMemo(() => {
    const API_BASE = "/forge";
    const AUTH_LOGIN = "/auth/login";
    return {
      method: "POST",
      url: `${API_BASE}${AUTH_LOGIN}`,
      headers: { "Content-Type": "application/json" },
      body: { name: name.trim(), password },
    };
  }, [name, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, password: true });
    if (hasErrors) return;

    try {
      const res = await LoginPerson({ name: name.trim(), password });
      console.log(res, "check the re sher");
      if (res?.error) {
        toast.error(res.message || "Login failed ❌");
      } else {
        toast.success("Logged in successfully 🎉", {
          description: `Welcome back, ${res?.user?.name || name.trim()}`,
        });
        initSocket(res?.token);
        localStorage.setItem("Token", `Bearer ${res?.token}`);
        navigate("/dashboard");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Network error during login";
      toast.error(message);
    }
    console.log("REQUEST_READY", requestPreview);
  }

  return (
    <div className="relative flex min-h-screen w-[80%] flex-col items-center justify-center overflow-hidden bg-[#0b0f14] text-[#e6eef8] antialiased">
      <a
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 text-[#a6b0bf] transition-colors hover:text-[#e6eef8]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </a>

      <div className="flex w-full max-w-[470px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[rgba(15,21,32,0.7)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <h1 className="mb-1 text-[32px] font-bold tracking-[0.3px] text-[#7c8cff]">
          TaskForge-Ai
        </h1>
        <p className="mb-8 text-[13px] text-[#a6b0bf]">
          Project &amp; Task Management
        </p>

        <div className="mb-4 text-center">
          <h2 className="text-[26px] font-semibold">Welcome back</h2>
          <p className="text-[14px] text-[#a6b0bf]">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-[13px] font-medium text-[#d7e0ea]">
              Username
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              className={`w-full rounded-xl border px-3 py-2.5 text-[#e6eef8] outline-none transition bg-[#0e1724] ${
                touched.name && errors.name
                  ? "border-red-400 focus:border-red-400 focus:[box-shadow:0_0_0_3px_rgba(248,113,113,0.25)]"
                  : "border-white/10 focus:border-[#5aa9e6] focus:[box-shadow:0_0_0_3px_rgba(90,169,230,0.25)]"
              }`}
            />
            {touched.name && errors.name ? (
              <p className="text-[12px] text-red-300">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-[13px] font-medium text-[#d7e0ea]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-[#e6eef8] outline-none transition bg-[#0e1724] ${
                  touched.password && errors.password
                    ? "border-red-400 focus:border-red-400 focus:[box-shadow:0_0_0_3px_rgba(248,113,113,0.25)]"
                    : "border-white/10 focus:border-[#5aa9e6] focus:[box-shadow:0_0_0_3px_rgba(90,169,230,0.25)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#a6b0bf] hover:text-[#e6eef8] cursor-pointer"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {touched.password && errors.password ? (
              <p className="text-[12px] text-red-300">{errors.password}</p>
            ) : (
              <p className="text-[12px] text-[#a6b0bf]">Use your TaskForge-Ai credentials</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={hasErrors}
              className={`w-full rounded-xl px-4 py-3 font-semibold tracking-[.2px] text-white cursor-pointer transition active:translate-y-px ${
                hasErrors
                  ? "bg-gradient-to-b from-[#7c8cff]/50 to-[#5c6af6]/50 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-b from-[#7c8cff] to-[#5c6af6] hover:opacity-95"
              }`}
            >
              Log In
            </button>
            <p className="text-center text-[13px] text-[#a6b0bf]">
              New here?{" "}
              <Link
                to="/auth/register"
                className="text-[#9be5ff] underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCardUI;
