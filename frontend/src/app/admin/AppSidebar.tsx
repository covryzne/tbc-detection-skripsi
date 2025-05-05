"use client";
import Link from "next/link";
import { RoundDashboard } from "@/icons/DashboardIcon";
import { History32Filled } from "@/icons/HistoryIcon";
import { MemberFilled } from "@/icons/MemberIcon";
import { HamburgerLg } from "@/icons/HamburgerIcon";
import { CloseXs } from "@/icons/CloseIcon";

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function AppSidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const menuItems = [
    { name: "Dashboard", icon: RoundDashboard, href: "/admin" },
    { name: "Riwayat Deteksi", icon: History32Filled, href: "/admin/history" },
    { name: "Deteksi TB", icon: MemberFilled, href: "/admin/deteksi" },
    { name: "Data User", icon: MemberFilled, href: "/admin/user" },
    { name: "Profile", icon: MemberFilled, href: "/admin/profile" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-primary text-white h-screen transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-center h-16 px-6 border-b border-gray-700">
        <div className="flex-1 overflow-hidden">
          <span
            className={`text-lg font-bold transition-all duration-300 inline-block transform ${
              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
          >
            TB Detector
          </span>
        </div>
        <button onClick={toggleSidebar}>
          {isOpen ? <CloseXs /> : <HamburgerLg />}
        </button>
      </div>

      <nav className="flex-1 mt-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-4 py-3 hover:bg-gray-500 transition"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <div className="overflow-hidden">
              <span
                className={`ml-4 inline-block whitespace-nowrap transition-all duration-300 transform ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
