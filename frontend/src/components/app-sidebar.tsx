"use client";

import * as React from "react";
import {
  IconDashboard,
  IconLungs,
  IconHistory,
  IconUser,
  IconChartBar,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "User Name",
    email: "user@example.com",
    avatar: "/api/placeholder/40/40",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Prediksi TB",
      url: "/admin/prediksi",
      icon: IconLungs,
    },
    {
      title: "Riwayat Deteksi",
      url: "/admin/riwayat",
      icon: IconHistory,
    },
    {
      title: "Profile",
      url: "/admin/profile",
      icon: IconUser,
    },
    {
      title: "Evaluation Metrics",
      url: "/admin/metrics",
      icon: IconChartBar,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="bg-white text-gray-800"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin/dashboard">
                <IconInnerShadowTop className="!size-5 text-[#001A6E]" />
                <span className="text-base font-semibold text-[#001A6E]">
                  TBC Detection
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
