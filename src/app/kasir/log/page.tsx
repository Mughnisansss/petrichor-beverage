"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function LogPenjualanPage() {
    const { sales, drinks, foods, rawMaterials, deleteSale } = useAppContext();
    const { toast } = useToast();

    const handleDelete = async (saleId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus catatan penjualan ini? Tindakan ini tidak dapat dibatalkan.")) {
            try {
                const result = await deleteSale(saleId);
                 if (!result.ok) {
                    throw new Error(result.message);
                }
                toast({
                    title: "Sukses",
                    description: result.message
                });
            } catch (error) {
                 toast({
                    title: "Error",
                    description: (error as Error).message,
                    variant: "destructive"
                });
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log Penjualan</CardTitle>
                <CardDescription>Menampilkan semua riwayat transaksi yang tercatat di sistem, diurutkan dari yang terbaru.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead>Info Tambahan</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.length > 0 ? (
                                sales.map(sale => {
                                    const product = sale.productType === 'drink'
                                        ? drinks.find(d => d.id === sale.productId)
                                        : foods.find(f => f.id === sale.productId);
                                    
                                    const toppingsList = (sale.selectedToppings || [])
                                        .map(topping => rawMaterials.find(m => m.id === topping.rawMaterialId)?.name)
                                        .filter(Boolean);

                                    return (
                                        <TableRow key={sale.id}>
                                            <TableCell className="text-sm">
                                                <div className="font-medium">{formatDate(sale.date, "dd MMM yyyy")}</div>
                                                <div className="text-muted-foreground">{formatDate(sale.date, "HH:mm")}</div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {sale.quantity}x {product?.name || 'Produk Dihapus'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {sale.selectedPackagingName && (
                                                        <Badge variant="outline">Ukuran: {sale.selectedPackagingName}</Badge>
                                                    )}
                                                    {toppingsList.length > 0 && (
                                                        <Badge variant="secondary">Topping: {toppingsList.join(', ')}</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(sale.totalSalePrice)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(sale.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Hapus</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Belum ada riwayat penjualan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
