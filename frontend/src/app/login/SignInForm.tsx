"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Kirim payload JSON sesuai UserLogin
      const res = await axios.post("/api/v1/token", { email, password });
      const { access_token } = res.data;
      console.log("Access token:", access_token);

      const userRes = await axios.get("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userRes.data; // Langsung ambil data
      console.log("User data:", user);

      if (!user?.id) {
        throw new Error("User ID not found in response");
      }

      // Bersihin localStorage sebelum simpen token baru
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // Simpen token dan user
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Cookie udah diset di backend, ga perlu set manual
      toast.success("Login successful");
      if (user.is_admin) {
        console.log("Redirecting to admin dashboard");
        router.push("/admin/dashboard");
      } else {
        console.log("Redirecting to user dashboard");
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      let errorMsg = "Login gagal. Periksa kembali email dan password.";
      if (err.response?.status === 422 && err.response?.data?.detail) {
        errorMsg = `Login gagal: ${JSON.stringify(err.response.data.detail)}`;
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data.detail || "Email atau password salah.";
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      console.error("Login error:", err, err.response);
      toast.error(errorMsg);
      // Hapus token kalo login gagal
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Sign In</h2>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter your email here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password here"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[36px] text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={isLoading}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default SignInForm;
