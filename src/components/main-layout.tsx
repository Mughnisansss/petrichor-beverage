"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const topNavItems = [
  { href: "/order", label: "Order" },
  { href: "/kasir", label: "Kasir" },
  { href: "/dompet", label: "Dompet" },
  { href: "/", label: "Dasbor" },
  { href: "/racik/minuman", label: "Produk" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, appName, orderQueue, marqueeText } = useAppContext();
  
  const settingsHref = "/pengaturan";
  const isOrderPage = pathname === '/order';
  
  const displayText = useMemo(() => marqueeText.replace(/{appName}/g, appName), [marqueeText, appName]);

  const isActive = (href: string, currentPath: string) => {
    if (href === '/') return currentPath === '/';
    if (href === '/racik/minuman') return currentPath.startsWith('/racik');
    if (href === '/kasir') return currentPath.startsWith('/kasir');
    if (href === '/dompet') return currentPath.startsWith('/dompet');
    return currentPath.startsWith(href);
  };

  const MobileNav = () => (
     <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka menu navigasi</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Logo />
            </Link>
            {topNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-foreground flex items-center gap-2",
                  isActive(item.href, pathname) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
                 {item.href === '/kasir' && orderQueue.length > 0 && (
                  <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {orderQueue.length}
                  </span>
                )}
              </Link>
            ))}
            <Link
                href={settingsHref}
                className={cn(
                  "hover:text-foreground",
                   "text-muted-foreground",
                  pathname.startsWith('/pengaturan') && "text-foreground"
                )}
              >
                Pengaturan
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
  )

  return (
    <div className={cn(
      "flex min-h-screen w-full flex-col",
      isOrderPage && 'theme-order'
    )}>
      <header className={cn(
        "sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50"
      )}>
        {!isOrderPage ? (
          <>
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                <Logo />
                <span className="sr-only">{appName}</span>
              </Link>
              {topNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground flex items-center gap-2",
                    isActive(item.href, pathname) ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                  {item.href === '/kasir' && orderQueue.length > 0 && (
                     <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                      {orderQueue.length}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="flex md:hidden">
                <MobileNav />
            </div>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <div className={cn(
                "flex-1 overflow-hidden flex items-center h-10 rounded-md",
                "bg-muted border border-input",
              )}>
                 <div className="relative flex overflow-x-hidden">
                    <div className="animate-marquee whitespace-nowrap">
                      <span className="mx-4 text-sm font-medium">{displayText}</span>
                    </div>
                    <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
                       <span className="mx-4 text-sm font-medium">{displayText}</span>
                    </div>
                  </div>
              </div>
              <ThemeToggle />
              <Link href={settingsHref} passHref>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Pengaturan</span>
                </Button>
              </Link>
            </div>
          </>
        ) : (
           <div className="flex-1 overflow-hidden flex items-center h-10 rounded-md bg-primary/10 text-primary">
             <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  <span className="mx-4 text-sm font-medium">{displayText}</span>
                  <span className="mx-4 text-sm font-medium">{displayText}</span>
                </div>
                <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
                   <span className="mx-4 text-sm font-medium">{displayText}</span>
                   <span className="mx-4 text-sm font-medium">{displayText}</span>
                </div>
              </div>
          </div>
        )}
      </header>
      <main className={cn(
        "flex flex-1 flex-col bg-background",
        !isOrderPage && "gap-4 p-4 md:gap-8 md:p-8"
      )}>
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
