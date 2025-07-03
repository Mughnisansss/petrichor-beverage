"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function PengaturanPage() {
  const { storageMode, setStorageMode } = useAppContext();
  const { toast } = useToast();

  const handleStorageChange = (value: "localStorage" | "api") => {
    setStorageMode(value);
    toast({
      title: "Pengaturan Disimpan",
      description: `Mode penyimpanan data telah diubah.`,
    });
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Pengaturan Penyimpanan Data</CardTitle>
            <CardDescription>
              Pilih di mana data aplikasi Anda akan disimpan. Perubahan akan diterapkan secara otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={storageMode}
              onValueChange={handleStorageChange}
              className="grid gap-4"
            >
              <Label
                htmlFor="localstorage"
                className="flex flex-col items-start gap-2 rounded-lg border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[div>input:checked]:border-primary"
              >
                <div className="flex items-center gap-4">
                   <RadioGroupItem value="localStorage" id="localstorage" />
                   <span className="font-bold text-base">Local Storage (Browser)</span>
                </div>
                <p className="pl-8 text-sm text-muted-foreground">
                  Data disimpan langsung di browser Anda. Cepat dan berfungsi offline, namun data akan hilang jika cache browser dibersihkan. Pilihan yang baik untuk penggunaan pribadi.
                </p>
              </Label>
              <Label
                htmlFor="api"
                className="flex flex-col items-start gap-2 rounded-lg border p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[div>input:checked]:border-primary"
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem value="api" id="api" />
                  <span className="font-bold text-base">File Server (db.json)</span>
                </div>
                 <p className="pl-8 text-sm text-muted-foreground">
                  Data disimpan di server dalam file `db.json`. Memungkinkan data untuk dibagikan antar perangkat jika di-deploy, tetapi kurang cocok untuk produksi skala besar.
                </p>
              </Label>
               <Label
                htmlFor="cloud"
                className="flex flex-col items-start gap-2 rounded-lg border p-4 cursor-not-allowed opacity-50"
              >
                 <div className="flex items-center gap-4">
                  <RadioGroupItem value="cloud" id="cloud" disabled />
                   <span className="font-bold text-base">Database Cloud (Segera Hadir)</span>
                </div>
                <p className="pl-8 text-sm text-muted-foreground">
                  Opsi paling andal untuk produksi. Data akan disimpan di database cloud profesional seperti Firebase Firestore. Fitur ini sedang dalam pengembangan.
                </p>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
