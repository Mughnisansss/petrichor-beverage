"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PenjualanPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 items-center justify-center text-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Halaman Telah Dipindahkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Halaman 'Penjualan' sekarang dapat diakses melalui menu 'Kasir' di navigasi utama.</p>
            <Button asChild className="mt-4">
                <Link href="/kasir">Buka Halaman Kasir</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
