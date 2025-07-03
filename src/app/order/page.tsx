"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CupSoda, Utensils } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { Separator } from "@/components/ui/separator";

export default function OrderPage() {
  const { drinks, foods, appName } = useAppContext();

  // A simple toast handler for the "Pesan" button for now.
  const handleOrderClick = (itemName: string) => {
    // In a real app, this would add to a cart.
    // For now, we can just show a placeholder alert.
    alert(`${itemName} telah ditambahkan ke pesanan (fitur keranjang belum diimplementasikan).`);
  };

  return (
    <MainLayout>
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Selamat Datang di {appName}</h1>
            <p className="text-lg text-muted-foreground mt-2">Silakan lihat menu kami di bawah ini.</p>
        </div>

        <div className="space-y-12">
            {/* Minuman Section */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <CupSoda className="h-8 w-8 text-primary"/>
                    <h2 className="text-3xl font-bold">Minuman</h2>
                </div>
                {drinks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {drinks.map(item => (
                        <Card key={item.id} className="flex flex-col text-left">
                            <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-xl font-semibold text-primary">{formatCurrency(item.sellingPrice)}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleOrderClick(item.name)}>
                                    Pesan
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Menu minuman akan segera hadir.</p>
                )}
            </div>

            <Separator />

            {/* Makanan Section */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Utensils className="h-8 w-8 text-primary"/>
                    <h2 className="text-3xl font-bold">Makanan</h2>
                </div>
                {foods.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {foods.map(item => (
                        <Card key={item.id} className="flex flex-col text-left">
                           <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-xl font-semibold text-primary">{formatCurrency(item.sellingPrice)}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleOrderClick(item.name)}>
                                    Pesan
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    </div>
                ) : (
                     <p className="text-muted-foreground">Menu makanan akan segera hadir.</p>
                )}
            </div>
        </div>
    </MainLayout>
  );
}
