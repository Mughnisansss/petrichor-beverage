"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CupSoda, DollarSign, LayoutDashboard, LineChart, ClipboardList, Lightbulb, Settings, Menu, ChevronDown } from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/penjualan", label: "Penjualan", icon: DollarSign },
];

const racikItems = [
    { href: "/minuman", label: "Minuman", icon: CupSoda },
    { href: "/operasional", label: "Biaya Operasional", icon: ClipboardList },
]

const otherItems = [
  { href: "/saran-harga", label: "Saran Harga", icon: Lightbulb },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAppContext();

  const isRacikActive = racikItems.some(item => pathname.startsWith(item.href));

  const renderNavLinks = (isMobile = false) => (
    <>
      {navItems.map(item => (
         <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === item.href ? "text-foreground" : "text-muted-foreground",
             isMobile && "flex items-center gap-4 px-2.5"
          )}
        >
          {isMobile && <item.icon className="h-5 w-5" />}
          {item.label}
        </Link>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "gap-1 px-2.5 transition-colors hover:text-foreground md:px-3",
            isRacikActive ? "text-foreground" : "text-muted-foreground",
            isMobile ? "justify-start" : ""
          )}>
            {isMobile && <ClipboardList className="h-5 w-5" />}
            Racik
            {!isMobile && <ChevronDown className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {racikItems.map(item => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {otherItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground",
            pathname === item.href ? "text-foreground" : "text-muted-foreground",
            isMobile && "flex items-center gap-4 px-2.5"
          )}
        >
          {isMobile && <item.icon className="h-5 w-5" />}
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 lg:gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground mr-2">
                <Logo />
            </Link>
            {renderNavLinks()}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
             <div className="flex h-14 items-center border-b px-6">
                <Link href="/" className="text-foreground">
                  <Logo />
                </Link>
              </div>
            <nav className="grid gap-4 p-4 text-base font-medium">
               {renderNavLinks(true)}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
           <Link href="/pengaturan" aria-label="Pengaturan">
              <Button variant="ghost" size="icon" className={cn(pathname === '/pengaturan' ? "bg-accent text-accent-foreground" : "")}>
                <Settings className="h-5 w-5" />
              </Button>
           </Link>
           <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
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
  );
}
