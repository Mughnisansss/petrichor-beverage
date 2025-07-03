"use client";

import React from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function KasirPage() {
  const { sales, drinks, addSale } = useAppContext();
  const { toast } = useToast();

  async function handleSell(drinkId: string) {
    try {
      const drink = drinks.find(d => d.id === drinkId);
      await addSale({
        drinkId,
        quantity: 1,
        discount: 0,
      });
      toast({
        title: "Penjualan Dicatat",
        description: `1x ${drink?.name || 'Minuman'} berhasil dijual.`,
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <MainLayout>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Kasir Penjualan Cepat</CardTitle>
              <CardDescription>Klik tombol pada item untuk mencatat penjualan (kuantitas 1, diskon 0%).</CardDescription>
            </CardHeader>
            <CardContent>
              {drinks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {drinks.map(drink => (
                    <Card key={drink.id} className="flex flex-col">
                      <CardHeader className="p-4 flex-grow">
                        <CardTitle className="text-base leading-tight">{drink.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                         <p className="text-sm font-semibold">{formatCurrency(drink.sellingPrice)}</p>
                      </CardContent>
                      <CardFooter className="p-2">
                        <Button className="w-full" onClick={() => handleSell(drink.id)} size="sm">
                            <Plus className="mr-2 h-4 w-4"/> Jual
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-center text-muted-foreground p-4">
                  Belum ada minuman yang ditambahkan. Silakan tambahkan di halaman 'Produk'.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Riwayat Penjualan (Terbaru)</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Minuman</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.length > 0 ? (
                      sales.map(sale => {
                        const drink = drinks.find(d => d.id === sale.drinkId);
                        const total = drink ? drink.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0;
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                            <TableCell className="font-medium">{drink?.name || 'N/A'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Belum ada riwayat penjualan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
