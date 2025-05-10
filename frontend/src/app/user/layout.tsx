// app/user/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isClientLoading, setIsClientLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : {};
    setUser(userData);
    setIsClientLoading(false);

    if (userData?.is_admin) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  // Render Skeleton di client-side selama isClientLoading
  if (isClientLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Skeleton untuk Sidebar */}
        <div className="w-64 bg-white border-r">
          <div className="p-4">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <div className="absolute bottom-4 w-64 p-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        {/* Skeleton untuk Header dan Konten */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b p-4">
            <Skeleton className="h-10 w-1/2" />
          </div>
          <div className="p-6">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Render konten utama (sama di server dan client)
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
