"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/main-layout";

const DompetNav = () => {
    const pathname = usePathname();
    const navItems = [
        { href: "/dompet", label: "Kas Harian" },
        { href: "/dompet/operasional", label: "Biaya Operasional" },
    ];

    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4 w-full sm:w-auto">
            <div className="grid grid-cols-2 w-full">
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
        </div>
    );
};

export default function DompetLayout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
            <div className="flex flex-col items-start gap-4">
                <DompetNav />
                <div className="w-full">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
}
