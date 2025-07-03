
"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function PenjualanPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 items-center justify-center text-center h-full">
        <Card className="w-full max-w-lg">
          <CardHeader>
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Halaman Telah Dipindahkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Halaman 'Penjualan' sekarang menjadi bagian dari sistem 'Kasir' yang lebih lengkap, yang juga menangani orderan pelanggan.
            </p>
            <Button asChild className="mt-4">
                <Link href="/kasir">Buka Halaman Kasir</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
