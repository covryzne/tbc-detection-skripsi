// NavMain.tsx
"use client";

import { type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a
                    href={item.url}
                    className={cn(
                      "transition-none", // Disable transitions
                      isActive
                        ? "!bg-[#001A6E] !text-white [&:hover]:!bg-[#001A6E]" // Force styles with !important
                        : "hover:bg-gray-100"
                    )}
                    style={
                      isActive
                        ? {
                            backgroundColor: "#001A6E",
                            color: "white",
                            // Prevent any hover effects with pointer-events
                            pointerEvents: "auto",
                          }
                        : {}
                    }
                  >
                    {item.icon && (
                      <item.icon className={isActive ? "text-white" : ""} />
                    )}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
