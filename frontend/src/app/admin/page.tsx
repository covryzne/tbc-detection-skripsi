"use client";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import { useState } from "react";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Selamat Datang, Admin!
          </h1>
          <p className="text-primaryLight">Ini adalah dashboard utama Anda.</p>
        </main>
      </div>
    </div>
  );
}
