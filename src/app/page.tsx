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

  const filteredSales = useMemo(() => {
    if (!date?.from || !date?.to) return [];
    return sales.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: date.from!, end: date.to! });
    });
  }, [sales, date]);

  const { totalRevenue, totalCost, totalOperationalCost, netProfit, bestSellingDrink } = useMemo(() => {
    if (!date?.from || !date?.to) {
        return { totalRevenue: 0, totalCost: 0, totalOperationalCost: 0, netProfit: 0, bestSellingDrink: 'Tidak ada' };
    }

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

    // --- Accurate Operational Cost Calculation ---
    // 1. Calculate one-time costs that fall within the selected period.
    const oneTimeCosts = operationalCosts
      .filter(c => c.recurrence === 'sekali' && isWithinInterval(parseISO(c.date), { start: date.from!, end: date.to! }))
      .reduce((sum, c) => sum + c.amount, 0);

    // 2. Calculate the total daily rate from all active recurring costs.
    // A recurring cost is considered active if it was created on or before the end of the period.
    const recurringDailyRate = operationalCosts
      .filter(c => c.recurrence !== 'sekali' && parseISO(c.date) <= date.to!)
      .reduce((sum, c) => {
        switch (c.recurrence) {
          case 'harian':
            return sum + c.amount;
          case 'mingguan':
            return sum + (c.amount / 7);
          case 'bulanan':
            return sum + (c.amount / 30); // Using 30 days for simplicity
          default:
            return sum;
        }
      }, 0);

    // 3. Prorate recurring costs for the number of days in the selected period.
    const numberOfDays = differenceInDays(date.to, date.from) + 1;
    const totalRecurringCost = recurringDailyRate * numberOfDays;

    // 4. The total operational cost is the sum of one-time and prorated recurring costs.
    const finalOperationalCost = oneTimeCosts + totalRecurringCost;
    
    return { 
        totalRevenue: revenue, 
        totalCost: cost, 
        totalOperationalCost: finalOperationalCost,
        netProfit: revenue - cost - finalOperationalCost,
        bestSellingDrink: topDrink
    };
  }, [filteredSales, drinks, operationalCosts, date]);

  const salesChartData = useMemo(() => {
    if (!date?.from || !date?.to) return [];

    const dailyRevenue = new Map<string, number>();
    filteredSales.forEach(sale => {
      const saleDate = format(parseISO(sale.date), "yyyy-MM-dd");
      const drink = drinks.find(d => d.id === sale.drinkId);
      if (drink) {
        const revenue = drink.sellingPrice * sale.quantity * (1 - sale.discount / 100);
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
  }, [date, filteredSales, drinks]);

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

        <Card>
            <CardHeader>
                <CardTitle>Analisis Pendapatan</CardTitle>
                <CardDescription>Pendapatan harian untuk periode yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent>
              {salesChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
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
    </MainLayout>
  );
}
