"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
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
  addDays,
  format,
  differenceInDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { MainLayout } from "@/components/main-layout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const { sales, drinks, foods, operationalCosts } = useAppContext();
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

  const filteredSales = useMemo(() => {
    if (!date?.from || !date?.to) return [];
    return sales.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: date.from!, end: date.to! });
    });
  }, [sales, date]);

  const { totalRevenue, totalCost, totalOperationalCost, netProfit, bestSellingProduct } = useMemo(() => {
    if (!date?.from || !date?.to) {
        return { totalRevenue: 0, totalCost: 0, totalOperationalCost: 0, netProfit: 0, bestSellingProduct: 'Tidak ada' };
    }

    let revenue = 0;
    let cost = 0;
    const salesByProduct: { [key: string]: { quantity: number; name: string } } = {};

    filteredSales.forEach(sale => {
      const { productId, productType, quantity, discount } = sale;
      const product = productType === 'drink'
        ? drinks.find(d => d.id === productId)
        : foods.find(f => f.id === productId);
      
      if (product) {
        const saleRevenue = product.sellingPrice * quantity * (1 - discount / 100);
        revenue += saleRevenue;
        cost += product.costPrice * quantity;
        
        if (!salesByProduct[product.id]) {
            salesByProduct[product.id] = { quantity: 0, name: product.name };
        }
        salesByProduct[product.id].quantity += quantity;
      }
    });
    
    const sortedProducts = Object.values(salesByProduct).sort((a,b) => b.quantity - a.quantity);
    const topProduct = sortedProducts.length > 0 ? `${sortedProducts[0].name} (${sortedProducts[0].quantity} terjual)` : 'Tidak ada';

    // --- Accurate Operational Cost Calculation ---
    const oneTimeCosts = operationalCosts
      .filter(c => c.recurrence === 'sekali' && isWithinInterval(parseISO(c.date), { start: date.from!, end: date.to! }))
      .reduce((sum, c) => sum + c.amount, 0);

    const recurringDailyRate = operationalCosts
      .filter(c => c.recurrence !== 'sekali' && parseISO(c.date) <= date.to!)
      .reduce((sum, c) => {
        switch (c.recurrence) {
          case 'harian':
            return sum + c.amount;
          case 'mingguan':
            return sum + (c.amount / 7);
          case 'bulanan':
            return sum + (c.amount / 30);
          default:
            return sum;
        }
      }, 0);

    const numberOfDays = differenceInDays(date.to, date.from) + 1;
    const totalRecurringCost = recurringDailyRate * numberOfDays;

    const finalOperationalCost = oneTimeCosts + totalRecurringCost;
    
    return { 
        totalRevenue: revenue, 
        totalCost: cost, 
        totalOperationalCost: finalOperationalCost,
        netProfit: revenue - cost - finalOperationalCost,
        bestSellingProduct: topProduct
    };
  }, [filteredSales, drinks, foods, operationalCosts, date]);

  const salesChartData = useMemo(() => {
    if (!date?.from || !date?.to) return [];

    const dailyRevenue = new Map<string, number>();
    filteredSales.forEach(sale => {
      const saleDate = format(parseISO(sale.date), "yyyy-MM-dd");
      const { productId, productType, quantity, discount } = sale;
      const product = productType === 'drink'
        ? drinks.find(d => d.id === productId)
        : foods.find(f => f.id === productId);

      if (product) {
        const revenue = product.sellingPrice * quantity * (1 - discount / 100);
        dailyRevenue.set(saleDate, (dailyRevenue.get(saleDate) || 0) + revenue);
      }
    });

    const chartData: { date: string; revenue: number }[] = [];
    let currentDate = date.from;
    while (currentDate <= date.to) {
      const fullDateStr = format(currentDate, "yyyy-MM-dd");
      const shortDateStr = format(currentDate, "dd MMM");
      chartData.push({
        date: shortDateStr,
        revenue: dailyRevenue.get(fullDateStr) || 0,
      });
      currentDate = addDays(currentDate, 1);
    }
    return chartData;
  }, [date, filteredSales, drinks, foods]);

  const chartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

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

        <div className="grid items-start gap-4 md:gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 grid auto-rows-max items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Analisis Pendapatan</CardTitle>
                        <CardDescription>Pendapatan harian untuk periode yang dipilih.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {salesChartData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={salesChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickFormatter={(value) => formatCurrency(Number(value))}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent
                                        formatter={(value) => formatCurrency(Number(value))}
                                        labelClassName="text-sm"
                                    />}
                                />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          Belum ada data penjualan pada rentang ini untuk ditampilkan.
                        </div>
                      )}
                    </CardContent>
                </Card>
            </div>
            {/* Right Column */}
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Laba Bersih</CardTitle>
                        <CardDescription>Pendapatan setelah dikurangi HPP & biaya operasional.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(netProfit)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Periode</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Pendapatan</span>
                            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total HPP</span>
                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Biaya Operasional</span>
                            <span className="font-semibold">{formatCurrency(totalOperationalCost)}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{bestSellingProduct}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
