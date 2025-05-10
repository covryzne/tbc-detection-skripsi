// login/SignInForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/token", { email, password });
      const { access_token } = res.data;

      const userRes = await axios.get("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = userRes.data.user;

      document.cookie = `auth_token=${access_token}; path=/; max-age=1800`;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.is_admin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      setError("Login gagal. Periksa kembali email dan password.");
      console.error(err);
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
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[36px] text-gray-600 hover:text-gray-800 focus:outline-none"
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
        className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Login
      </button>
    </form>
  );
};

export default SignInForm;
