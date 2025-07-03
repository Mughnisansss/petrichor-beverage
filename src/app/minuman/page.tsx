"use client";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MinumanPageMoved() {
  return (
    <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Halaman Dipindahkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Halaman ini telah dipindahkan ke bagian "Racik". Silakan akses melalui navigasi baru.</p>
          </CardContent>
        </Card>
    </MainLayout>
  );
}
