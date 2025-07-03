"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PengaturanPage() {
  const { toast } = useToast();

  const handleExport = () => {
    // This is a placeholder. In a real app, you'd fetch all data
    // from your context or API and convert it to JSON.
    const data = "Placeholder for all application data in JSON format";
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "petrichor_backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Ekspor Berhasil",
      description: "Data Anda telah diunduh sebagai file JSON.",
    });
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Pengaturan Aplikasi</CardTitle>
            <CardDescription>
              Kelola pengaturan umum dan data aplikasi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Ekspor Data</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Unduh semua data aplikasi (minuman, penjualan, biaya) dalam format JSON sebagai cadangan.
              </p>
              <Button onClick={handleExport} variant="outline">
                Ekspor Semua Data
              </Button>
            </div>
             <div>
              <h3 className="text-lg font-medium">Mode Penyimpanan</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Aplikasi ini saat ini menyimpan data di server dalam file `db.json`. Opsi untuk beralih ke Local Storage atau Database Cloud sedang dalam pengembangan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
