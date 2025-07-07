"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart2 } from "lucide-react";

export default function DompetPageMoved() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8 justify-center items-center h-full">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <BarChart2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4">Halaman Telah Dipindahkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Manajemen 'Kas Harian' kini telah diintegrasikan ke dalam Dasbor utama untuk analisis dan pengelolaan keuangan yang terpusat.
            </p>
            <Button asChild>
                <Link href="/">Buka Dasbor</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
