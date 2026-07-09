"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { StorageModeSelector } from "@/components/storage-mode-selector";

export default function StoragePage() {
    return (
        <MainLayout>
            <StorageModeSelector />
        </MainLayout>
    );
}