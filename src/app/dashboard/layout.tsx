"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
            <div className="w-full">
                {children}
            </div>
        </MainLayout>
    );
}
