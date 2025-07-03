"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CupSoda,
  DollarSign,
  LayoutDashboard,
  ClipboardList,
  Lightbulb,
  Settings,
  Menu,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/penjualan", label: "Penjualan", icon: DollarSign },
  { href: "/minuman", label: "Minuman", icon: CupSoda },
  { href: "/operasional", label: "Biaya Operasional", icon: ClipboardList },
  { href: "/saran-harga", label: "Saran Harga", icon: Lightbulb },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAppContext();
  const isMobile = useIsMobile();
  
  const [isSidebarOpen, setSidebarOpen] = useLocalStorage("sidebar-open", true);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const NavLinks = () => (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
              isSidebarOpen={isSidebarOpen || isMobile}
              onClick={() => isMobile && setMobileMenuOpen(false)}
            >
              <a>
                <item.icon className="h-5 w-5" />
                {(isSidebarOpen || isMobile) && <span>{item.label}</span>}
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        <SidebarHeader isSidebarOpen={isSidebarOpen || isMobile}>
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Logo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarInset>
            <NavLinks />
          </SidebarInset>
        </SidebarContent>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
           <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka Menu</span>
          </Button>
           <SidebarTrigger
            onClick={toggleSidebar}
            className="hidden md:flex"
           />
          <div className="flex w-full items-center justify-end gap-2">
            <Link href="/pengaturan" aria-label="Pengaturan">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  pathname === "/pengaturan" && "bg-accent text-accent-foreground"
                )}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
              </div>
              <Skeleton className="h-80 rounded-lg" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
