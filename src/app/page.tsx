
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, BarChart2, ShoppingCart, CupSoda, Settings, Palette } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, href }: { icon: React.ElementType, title: string, description: string, href: string }) => (
  <Link href={href} className="group">
    <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-12">
        <div className="text-center py-12 px-6 bg-muted/50 rounded-lg border">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Selamat Datang di Petrichor
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Aplikasi kasir dan manajemen kafe, seindah wangi tanah setelah hujan.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <FeatureCard 
              icon={BarChart2}
              title="Analisis Keuangan"
              description="Pantau laba, pendapatan, dan HPP secara real-time. Buat keputusan berdasarkan data, bukan tebakan."
              href="/analisa"
            />
            <FeatureCard 
              icon={ShoppingCart}
              title="Sistem Kasir (POS)"
              description="Antarmuka kasir modern dengan mode antrian dan penjualan cepat. Terintegrasi langsung dengan menu Anda."
              href="/kasir"
            />
             <FeatureCard 
              icon={CupSoda}
              title="Manajemen Produk & Resep"
              description="Atur resep, hitung HPP secara otomatis, dan kelola semua bahan baku dengan mudah."
              href="/racik/minuman"
            />
             <FeatureCard 
              icon={Settings}
              title="Pengaturan Aplikasi"
              description="Personalisasi aplikasi, kelola data, dan lakukan backup atau restore data Anda dengan aman."
              href="/pengaturan"
            />
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Siap Memulai?</CardTitle>
                <CardDescription>Jelajahi fitur-fitur yang ada untuk mengoptimalkan manajemen kafe Anda hari ini.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/kasir/cepat">Mulai Penjualan Cepat <ArrowRight className="ml-2"/></Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/racik/minuman">Tambah Produk Baru <ArrowRight className="ml-2"/></Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
