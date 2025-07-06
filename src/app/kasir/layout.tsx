"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { MainLayout } from "@/components/main-layout";
import { cn } from "@/lib/utils";

const KasirNav = () => {
    const pathname = usePathname();
    const navItems = [
        { href: "/kasir/orderan", label: "Antrian Orderan" },
        { href: "/kasir/cepat", label: "Penjualan Cepat" },
        { href: "/kasir/log", label: "Log Penjualan" },
    ];
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4 w-full grid grid-cols-3">
            {navItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        pathname === item.href
                            ? "bg-background text-foreground shadow-sm"
                            : ""
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
};

export default function KasirLayout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
           <div className="w-full">
                <KasirNav />
                {children}
            </div>
        </MainLayout>
    );
}
