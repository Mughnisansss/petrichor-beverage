"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { CupSoda, DollarSign, LayoutDashboard, Lightbulb, LineChart, PanelLeft } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/minuman", label: "Minuman", icon: CupSoda },
  { href: "/penjualan", label: "Penjualan", icon: DollarSign },
  { href: "/laporan", label: "Laporan", icon: LineChart },
  { href: "/saran-harga", label: "Saran Harga", icon: Lightbulb },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const activeItem = navItems.find(item => item.href === pathname);
    return activeItem ? activeItem.label : "Dashboard";
  };
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger className="md:hidden">
             <PanelLeft />
          </SidebarTrigger>
          <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
