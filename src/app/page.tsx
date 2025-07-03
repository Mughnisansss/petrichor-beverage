"use client";

import React, { useState, useMemo } from "react";
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

export default function DashboardPage() {
  const { sales, drinks, operationalCosts } = useAppContext();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const filterByDate = (items: Array<{ date: string }>) => {
     if (!date?.from || !date?.to) return items;
     const endOfDay = new Date(date.to);
     endOfDay.setHours(23, 59, 59, 999);
     return items.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: date!.from!, end: endOfDay });
     });
  };

  const filteredSales = useMemo(() => filterByDate(sales), [sales, date]);
  const filteredOperationalCosts = useMemo(() => filterByDate(operationalCosts), [operationalCosts, date]);

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
  );
}
