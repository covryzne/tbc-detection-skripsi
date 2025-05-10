// components/app-sidebar.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconDashboard,
  IconLungs,
  IconHistory,
  IconUser,
  IconChartBar,
  IconSettings,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    avatar: string;
    name: string;
    email: string;
    is_admin: boolean;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navMain = user?.is_admin
    ? [
        { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },
        { title: "TB Prediction", url: "/admin/prediction", icon: IconLungs },
        { title: "History", url: "/admin/history", icon: IconHistory },
        {
          title: "Evaluation Metrics",
          url: "/admin/metrics",
          icon: IconChartBar,
        },
        { title: "Users", url: "/admin/users", icon: IconUser },
        { title: "Settings", url: "/admin/settings", icon: IconSettings },
      ]
    : [
        { title: "Dashboard", url: "/user/dashboard", icon: IconDashboard },
        { title: "TB Prediction", url: "/user/prediction", icon: IconLungs },
        { title: "History", url: "/user/history", icon: IconHistory },
        {
          title: "Evaluation Metrics",
          url: "/user/metrics",
          icon: IconChartBar,
        },
        { title: "Settings", url: "/user/settings", icon: IconSettings },
      ];

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
              <a href={user?.is_admin ? "/admin/dashboard" : "/user/dashboard"}>
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? { ...user, avatar: user.avatar || "/api/placeholder/40/40" }
              : {
                  name: "Guest",
                  email: "No email",
                  avatar: "/api/placeholder/40/40",
                }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
