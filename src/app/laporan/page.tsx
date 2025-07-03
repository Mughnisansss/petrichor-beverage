"use client";

import React, { useState, useMemo } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { addDays, isWithinInterval, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function LaporanPage() {
  const { sales, drinks, operationalCosts } = useAppContext();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const filterByDate = (items: Array<{ date: string }>) => {
     if (!date?.from || !date?.to) return items;
     return items.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: date!.from!, end: date!.to! });
     });
  };

  const filteredSales = useMemo(() => filterByDate(sales), [sales, date]);
  const filteredOperationalCosts = useMemo(() => filterByDate(operationalCosts), [operationalCosts, date]);

  const { totalRevenue, totalCost, totalOperationalCost, netProfit } = useMemo(() => {
    let revenue = 0;
    let cost = 0;

    filteredSales.forEach(sale => {
      const drink = drinks.find(d => d.id === sale.drinkId);
      if (drink) {
        revenue += drink.sellingPrice * sale.quantity * (1 - sale.discount / 100);
        cost += drink.costPrice * sale.quantity;
      }
    });

    const operationalCost = filteredOperationalCosts.reduce((acc, curr) => acc + curr.amount, 0);
    
    return { 
        totalRevenue: revenue, 
        totalCost: cost, 
        totalOperationalCost: operationalCost,
        netProfit: revenue - cost - operationalCost 
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
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {formatDate(date.from.toISOString(), "LLL dd, y")} -{" "}
                          {formatDate(date.to.toISOString(), "LLL dd, y")}
                        </>
                      ) : (
                        formatDate(date.from.toISOString(), "LLL dd, y")
                      )
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Total Pendapatan</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Biaya Pokok</CardTitle></CardHeader>
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

        <div className="grid gap-4 lg:grid-cols-1">
          <Card>
            <CardHeader><CardTitle>Detail Transaksi Penjualan</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Minuman</TableHead>
                    <TableHead>Jml</TableHead>
                    <TableHead>Diskon</TableHead>
                    <TableHead>Harga Pokok</TableHead>
                    <TableHead>Pendapatan</TableHead>
                    <TableHead>Laba</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map(sale => {
                     const drink = drinks.find(d => d.id === sale.drinkId);
                     const revenue = drink ? drink.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0;
                     const cost = drink ? drink.costPrice * sale.quantity : 0;
                     const profit = revenue - cost;
                     return (
                      <TableRow key={sale.id}>
                        <TableCell>{formatDate(sale.date, "dd MMM yyyy")}</TableCell>
                        <TableCell>{drink?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{sale.discount}%</TableCell>
                        <TableCell>{formatCurrency(cost)}</TableCell>
                        <TableCell>{formatCurrency(revenue)}</TableCell>
                        <TableCell>{formatCurrency(profit)}</TableCell>
                      </TableRow>
                     );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-1">
          <Card>
            <CardHeader><CardTitle>Detail Biaya Operasional</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperationalCosts.map(cost => (
                      <TableRow key={cost.id}>
                        <TableCell>{formatDate(cost.date, "dd MMM yyyy")}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{formatCurrency(cost.amount)}</TableCell>
                      </TableRow>
                     ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
