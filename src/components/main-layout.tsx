"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CupSoda, DollarSign, LayoutDashboard, Lightbulb, LineChart } from "lucide-react";
import { Logo } from "@/components/logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/minuman", label: "Minuman", icon: CupSoda },
  { href: "/penjualan", label: "Penjualan", icon: DollarSign },
  { href: "/laporan", label: "Laporan", icon: LineChart },
  { href: "/saran-harga", label: "Saran Harga", icon: Lightbulb },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = navItems.find(item => item.href === pathname)?.label || "Dashboard";
  const isMobile = useIsMobile();
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof isMobile !== 'undefined') {
      setSidebarOpen(!isMobile);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        <SidebarHeader isSidebarOpen={isSidebarOpen}>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  isSidebarOpen={isSidebarOpen}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className={cn("truncate", !isSidebarOpen && "hidden")}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger onClick={toggleSidebar} />
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
