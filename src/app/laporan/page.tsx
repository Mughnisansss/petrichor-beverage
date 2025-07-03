"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaporanPage() {
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Halaman Tidak Digunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fungsionalitas laporan telah dipindahkan ke halaman Dashboard utama.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
