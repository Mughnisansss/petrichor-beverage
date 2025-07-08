
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function AkunPengaturanPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mode Aplikasi Statis</CardTitle>
                <CardDescription>
                    Fitur autentikasi dan akun pengguna telah dinonaktifkan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <Info className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">Informasi Penyimpanan Data</h4>
                        <p className="text-sm text-muted-foreground">
                            Aplikasi ini sekarang berjalan dalam mode statis. Semua data yang Anda masukkan disimpan sesuai dengan pilihan Anda di menu "Manajemen Data". Tidak ada data yang terikat pada akun pengguna online.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
