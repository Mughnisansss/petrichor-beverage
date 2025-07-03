"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  isWithinInterval,
  parseISO,
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { MainLayout } from "@/components/main-layout";

export default function DashboardPage() {
  const { sales, drinks, operationalCosts } = useAppContext();
  const [filter, setFilter] = useState<string>("last_30_days");
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const now = new Date();
    let from: Date;
    let to: Date = endOfToday();

    switch (filter) {
      case "today":
        from = startOfToday();
        to = endOfToday();
        break;
      case "this_week":
        from = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        to = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "this_month":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "last_7_days":
        from = subDays(startOfToday(), 6);
        to = endOfToday();
        break;
      case "last_30_days":
      default:
        from = subDays(startOfToday(), 29);
        to = endOfToday();
        break;
    }
    setDate({ from, to });
  }, [filter]);

  const filterByDate = useCallback((items: Array<{ date: string }>) => {
    if (!date?.from || !date?.to) {
      return []; // Return empty array while date range is being calculated
    }
    return items.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: date.from!, end: date.to! });
    });
  }, [date]);

  const filteredSales = useMemo(() => filterByDate(sales), [sales, filterByDate]);
  const filteredOperationalCosts = useMemo(() => filterByDate(operationalCosts), [operationalCosts, filterByDate]);

  const { totalRevenue, totalCost, totalOperationalCost, netProfit, bestSellingDrink } = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    const salesByDrink: { [key: string]: { quantity: number; name: string } } = {};

    filteredSales.forEach(sale => {
      const drink = drinks.find(d => d.id === sale.drinkId);
      if (drink) {
        const saleRevenue = drink.sellingPrice * sale.quantity * (1 - sale.discount / 100);
        revenue += saleRevenue;
        cost += drink.costPrice * sale.quantity;
        
        if (!salesByDrink[drink.id]) {
            salesByDrink[drink.id] = { quantity: 0, name: drink.name };
        }
        salesByDrink[drink.id].quantity += sale.quantity;
      }
    });
    
    const sortedDrinks = Object.values(salesByDrink).sort((a,b) => b.quantity - a.quantity);
    const topDrink = sortedDrinks.length > 0 ? `${sortedDrinks[0].name} (${sortedDrinks[0].quantity} terjual)` : 'Tidak ada';

    const operationalCost = filteredOperationalCosts.reduce((acc, curr) => acc + curr.amount, 0);
    
    return { 
        totalRevenue: revenue, 
        totalCost: cost, 
        totalOperationalCost: operationalCost,
        netProfit: revenue - cost - operationalCost,
        bestSellingDrink: topDrink
    };
  }, [filteredSales, drinks, filteredOperationalCosts]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="this_week">Minggu Ini</SelectItem>
                  <SelectItem value="this_month">Bulan Ini</SelectItem>
                  <SelectItem value="last_7_days">7 Hari Terakhir</SelectItem>
                  <SelectItem value="last_30_days">30 Hari Terakhir</SelectItem>
                </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Total Pendapatan</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total HPP</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalCost)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Biaya Operasional</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalOperationalCost)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Laba Bersih</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-primary">{formatCurrency(netProfit)}</p></CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-1">
             <Card>
                <CardHeader><CardTitle>Minuman Terlaris</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{bestSellingDrink}</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Detail Penjualan</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Minuman</TableHead>
                      <TableHead>Jml</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map(sale => {
                         const drink = drinks.find(d => d.id === sale.drinkId);
                         const revenue = drink ? drink.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0;
                         return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "dd MMM yyyy")}</TableCell>
                            <TableCell className="font-medium">{drink?.name || 'N/A'}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(revenue)}</TableCell>
                          </TableRow>
                         );
                      })
                    ) : (
                      <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                              Belum ada data penjualan pada rentang ini.
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Detail Biaya Operasional</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOperationalCosts.length > 0 ? (
                      filteredOperationalCosts.map(cost => (
                        <TableRow key={cost.id}>
                          <TableCell>{formatDate(cost.date, "dd MMM yyyy")}</TableCell>
                          <TableCell className="font-medium">{cost.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cost.amount)}</TableCell>
                        </TableRow>
                       ))
                    ) : (
                      <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                              Belum ada biaya operasional pada rentang ini.
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
