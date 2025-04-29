"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

const LoginPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-10">
        <img
          src="/login-lung.png"
          alt="TB Animation"
          className="w-2/4 h-auto rounded-lg object-contain drop-shadow-[0_10px_20px_rgba(255,255,255,0.2)]"
        />
        <h1 className="text-4xl font-bold mb-4 text-center mt-[30px] mb-4">
          Selamat Datang di Sistem Deteksi TB
        </h1>
        <p className="text-sm text-center mb-8">
          TB Detector membantu mendeteksi penyakit tuberkulosis dengan teknologi
          AI
        </p>
      </div>

      {/* KANAN: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-100 p-10">
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
          {isSignIn ? <SignInForm /> : <SignUpForm />}
          <div className="text-center mt-4">
            {isSignIn ? (
              <p className="text-sm">
                Belum punya akun?{" "}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="text-primary font-semibold hover:underline"
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p className="text-sm">
                Sudah punya akun?{" "}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
