"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function LogPenjualanPage() {
    const { sales, drinks, foods, rawMaterials } = useAppContext();

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
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
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
