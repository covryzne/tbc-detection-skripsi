"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LungLogo from "./components/icons/LungLogo";

export default function Header() {
  const rawPathname = usePathname();
  const router = useRouter();
  const [pathname, setPathname] = useState("");

  const [user, setUser] = useState<{ email: string; is_admin: boolean } | null>(
    null
  );

  // Function untuk ngecek token di localStorage
  const checkUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const userData = JSON.parse(decodedPayload.sub); // isi dari subject FastAPI
        setUser(userData);
      } catch (err) {
        console.error("Failed to decode token", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setPathname(rawPathname);
    checkUserFromToken();
  }, [rawPathname]);

  const handleAuthClick = () => {
    if (user) {
      // Logout
      localStorage.removeItem("token");
      setUser(null);
      router.push("/"); // Optional, langsung lempar ke login page
    } else {
      // Login
      router.push("/login");
    }
  };

  const content = {
    logo: {
      icon: (
        <Link href="/">
          <LungLogo className="w-9 h-9" />
        </Link>
      ),
      title: (
        <Link href="/">
          <span className="text-primary ml-2"> TB </span>
          <span className="text-primary"> DETECTOR </span>
        </Link>
      ),
    },

    menus: [
      { title: "Home", link: "/" },
      { title: "About", link: "/about" },
      { title: "FAQ", link: "/faq" },
      { title: "TB News", link: "/tb-news" },
    ],
  };

  return (
    <header className="flex w-full py-6 border-b">
      <nav className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex cursor-pointer flex-row items-center space-x-2">
          <span className="text-yellow-600">{content.logo.icon}</span>
          <span className="text-2xl font-bold text-sky-800">
            {content.logo.title}
          </span>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-row space-x-14">
          {content.menus.map((item, i) => {
            const isActive = pathname === item.link;
            return (
              <Link href={item.link} key={i}>
                <li
                  className={`${
                    isActive
                      ? "font-bold text-sky-900 underline underline-offset-8"
                      : "text-primary"
                  } transition hover:text-sky-900`}
                >
                  {item.title}
                </li>
              </Link>
            );
          })}
        </ul>

        {/* Auth Buttons */}
        <div className="flex flex-col items-end gap-1">
          {user && (
            <div className="text-sm text-sky-800 font-semibold">
              {user.email} ({user.is_admin ? "Admin" : "Admin"})
            </div>
          )}
          <button
            className="rounded-md bg-sky-900 px-6 py-3 font-semibold text-white transition hover:bg-sky-900/90 focus:outline-none z-10"
            onClick={handleAuthClick}
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </nav>
    </header>
  );
}
