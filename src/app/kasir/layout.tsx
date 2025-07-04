"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { isSameDay, startOfToday, parseISO } from "date-fns";

const KasirNav = () => {
    const pathname = usePathname();
    const navItems = [
        { href: "/kasir/orderan", label: "Antrian Orderan" },
        { href: "/kasir/cepat", label: "Penjualan Cepat" },
        { href: "/kasir/dompet", label: "Dompet" },
    ];
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4 w-full grid grid-cols-3">
            {navItems.map(item => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        pathname === item.href
                            ? "bg-background text-foreground shadow-sm"
                            : ""
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
};

export default function KasirLayout({ children }: { children: React.ReactNode }) {
    const { sales, drinks, foods, rawMaterials } = useAppContext();
    
    return (
        <MainLayout>
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <KasirNav />
                    {children}
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                        <CardTitle>Riwayat Penjualan (Terbaru)</CardTitle>
                        <CardDescription>Menampilkan 25 transaksi terakhir hari ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="max-h-[70vh] overflow-y-auto">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length > 0 ? (
                                sales.filter(s => isSameDay(parseISO(s.date), startOfToday()))
                                .slice(0, 25).map(sale => {
                                    const product = sale.productType === 'drink'
                                        ? drinks.find(d => d.id === sale.productId)
                                        : foods.find(f => f.id === sale.productId);
                                    const total = sale.totalSalePrice;
                                    return (
                                    <TableRow key={sale.id}>
                                        <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                                        <TableCell className="font-medium">
                                        {sale.quantity}x {product?.name || 'N/A'} {sale.selectedPackagingName && `(${sale.selectedPackagingName})`}
                                        {sale.selectedToppings && sale.selectedToppings.length > 0 && (
                                            <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                            {sale.selectedToppings.map(topping => {
                                                const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                                                return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>
                                            })}
                                            </ul>
                                        )}
                                        </TableCell>
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
