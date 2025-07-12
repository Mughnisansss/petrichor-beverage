
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, Legend } from "recharts";
import {
  DollarSign, LineChart as LineChartIcon, ShoppingCart, PackageSearch,
  Coffee, TrendingDown, Target, Utensils, GlassWater, Lightbulb, TrendingUp, Clock, Award
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  isWithinInterval, parseISO, startOfToday, endOfToday, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subDays, addDays, format, differenceInDays,
  subMonths, isSameDay, getHours
} from "date-fns";

import { useAppContext } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateSaleHpp, calculateOperationalCostForPeriod } from "@/lib/data-logic";
import { StatCard } from '@/components/analisa/stat-card';
import { OperasionalManager } from '@/components/analisa/operasional-manager';

export default function AnalisaPage() {
  const { sales, drinks, foods, operationalCosts, rawMaterials } = useAppContext();
  const [filter, setFilter] = useState<string>("last_7_days");
  const [dateRange, setDateRange] = useState<{ current: DateRange; previous: DateRange } | null>(null);

  // --- Hardcoded Daily Goal for demo ---
  const DAILY_REVENUE_GOAL = 1000000;

  useEffect(() => {
    const now = new Date();
    let currentFrom: Date;
    let currentTo: Date = endOfToday();
    let previousFrom: Date;
    let previousTo: Date;

    switch (filter) {
      case "today":
        currentFrom = startOfToday();
        previousFrom = subDays(currentFrom, 1);
        previousTo = endOfToday(previousFrom);
        break;
      case "this_week":
        currentFrom = startOfWeek(now, { weekStartsOn: 1 });
        const diffWeek = differenceInDays(currentTo, currentFrom) + 1;
        previousFrom = subDays(currentFrom, diffWeek);
        previousTo = subDays(currentTo, diffWeek);
        break;
      case "this_month":
        currentFrom = startOfMonth(now);
        previousFrom = startOfMonth(subMonths(now, 1));
        previousTo = endOfMonth(previousFrom);
        break;
      case "last_7_days":
      default:
        currentFrom = subDays(startOfToday(), 6);
        previousFrom = subDays(currentFrom, 7);
        previousTo = subDays(currentTo, 7);
        break;
      case "last_30_days":
        currentFrom = subDays(startOfToday(), 29);
        previousFrom = subDays(currentFrom, 30);
        previousTo = subDays(currentTo, 30);
        break;
    }
    setDateRange({
      current: { from: currentFrom, to: currentTo },
      previous: { from: previousFrom, to: previousTo }
    });
  }, [filter]);

  const {
    todayMetrics,
    lowStockItems,
    periodMetrics,
    salesChartData,
    peakHoursData,
    topProfitableProducts,
  } = useMemo(() => {
    if (!dateRange) return { todayMetrics: {}, lowStockItems: [], periodMetrics: {}, salesChartData: [], peakHoursData: [], topProfitableProducts: [] };

    // --- Today's Metrics ---
    const todayStart = startOfToday();
    const todaySales = sales.filter(s => isSameDay(parseISO(s.date), todayStart));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalSalePrice, 0);
    const todayTransactions = todaySales.length;
    
    // Correct logic for unique items sold today
    const soldProductIdsToday = new Set();
    todaySales.forEach(s => soldProductIdsToday.add(s.productId));

    const todayMetrics = {
        revenue: todayRevenue,
        transactions: todayTransactions,
        newItemsSoldCount: soldProductIdsToday.size,
        goalProgress: (todayRevenue / DAILY_REVENUE_GOAL) * 100
    };
    
    // --- Alerts ---
    const lowStockItems = rawMaterials.filter(
      (m) => m.lowStockThreshold && m.totalQuantity < m.lowStockThreshold
    );

    const currentPeriodSales = sales.filter(item => isWithinInterval(parseISO(item.date), { start: dateRange.current.from!, end: dateRange.current.to! }));

    // --- Period Metrics (for deep dive) ---
    const calculateMetricsForPeriod = (periodSales: typeof sales, periodRange: DateRange) => {
        let revenue = 0;
        let cost = 0;
        periodSales.forEach(sale => {
            revenue += sale.totalSalePrice || 0;
            cost += calculateSaleHpp(sale, drinks, foods, rawMaterials);
        });
        const finalOperationalCost = calculateOperationalCostForPeriod(periodRange, operationalCosts);
        const netProfit = revenue - cost - finalOperationalCost;
        return { totalRevenue: revenue, netProfit, totalHpp: cost, operationalCost: finalOperationalCost };
    };
    const periodMetrics = calculateMetricsForPeriod(currentPeriodSales, dateRange.current);

    // --- Product Profitability Data ---
    const salesByProduct: { [key: string]: { name: string; quantity: number; revenue: number; profit: number; type: 'drink' | 'food' } } = {};
    currentPeriodSales.forEach(sale => {
        const product = sale.productType === 'drink'
          ? drinks.find(d => d.id === sale.productId)
          : foods.find(f => f.id === sale.productId);
        if (product) {
          if (!salesByProduct[product.id]) {
            salesByProduct[product.id] = { name: product.name, quantity: 0, revenue: 0, profit: 0, type: sale.productType };
          }
          const hpp = calculateSaleHpp(sale, drinks, foods, rawMaterials);
          salesByProduct[product.id].quantity += sale.quantity || 0;
          salesByProduct[product.id].revenue += sale.totalSalePrice || 0;
          salesByProduct[product.id].profit += (sale.totalSalePrice || 0) - hpp;
        }
    });
    const topProfitableProducts = Object.values(salesByProduct).sort((a, b) => b.profit - a.profit).slice(0, 5);
    
    // --- Peak Hours Data ---
    const hourlySales: { [hour: number]: number } = {};
    for (let i = 0; i < 24; i++) {
        hourlySales[i] = 0;
    }
    currentPeriodSales.forEach(sale => {
        const hour = getHours(parseISO(sale.date));
        hourlySales[hour] += sale.totalSalePrice;
    });
    const peakHoursData = Object.entries(hourlySales)
        .map(([hour, revenue]) => ({ hour: `${parseInt(hour, 10).toString().padStart(2, '0')}:00`, revenue }))
        .filter(item => item.revenue > 0);


    // --- Comparison Chart Data ---
    const currentSalesMap = new Map<string, number>();
    currentPeriodSales.forEach(s => {
        const date = format(parseISO(s.date), "yyyy-MM-dd");
        currentSalesMap.set(date, (currentSalesMap.get(date) || 0) + s.totalSalePrice);
    });

    const previousSalesMap = new Map<string, number>();
    const diffDays = differenceInDays(dateRange.current.from!, dateRange.previous.from!);
    sales.filter(s => isWithinInterval(parseISO(s.date), { start: dateRange.previous.from!, end: dateRange.previous.to! }))
      .forEach(s => {
        const keyDate = format(addDays(parseISO(s.date), diffDays), "yyyy-MM-dd");
        previousSalesMap.set(keyDate, (previousSalesMap.get(keyDate) || 0) + s.totalSalePrice);
    });
    const chartData: { date: string; Pendapatan: number; 'Periode Sebelumnya': number }[] = [];
    let currentDate = dateRange.current.from!;
    while (currentDate <= dateRange.current.to!) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      chartData.push({
        date: format(currentDate, "dd MMM"),
        Pendapatan: currentSalesMap.get(dateKey) || 0,
        'Periode Sebelumnya': previousSalesMap.get(dateKey) || 0,
      });
      currentDate = addDays(currentDate, 1);
    }

    return { todayMetrics, lowStockItems, periodMetrics, salesChartData: chartData, topProfitableProducts, peakHoursData };

  }, [dateRange, sales, drinks, foods, operationalCosts, rawMaterials]);


  const lineChartConfig = {
    Pendapatan: { label: "Pendapatan", color: "hsl(var(--chart-1))" },
    'Periode Sebelumnya': { label: "Periode Sebelumnya", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;
  
  const barChartConfig = {
    revenue: { label: "Pendapatan", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;
  
  return (
    <div className="flex flex-col gap-8">
      <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pusat Kendali Harian</h1>
          <p className="text-muted-foreground">Selamat datang! Inilah ringkasan bisnis Anda hari ini.</p>
      </div>
      
      {/* Today's Snapshot Section */}
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="text-primary"/> Target Pendapatan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                  <span className="text-3xl font-bold text-primary">{formatCurrency(todayMetrics.revenue || 0)}</span>
                  <span className="text-sm text-muted-foreground">dari {formatCurrency(DAILY_REVENUE_GOAL)}</span>
              </div>
              <Progress value={todayMetrics.goalProgress || 0} />
              <div className="grid gap-4 pt-4 md:grid-cols-3">
                  <StatCard title="Pendapatan Hari Ini" value={formatCurrency(todayMetrics.revenue || 0)} icon={DollarSign} />
                  <StatCard title="Transaksi Hari Ini" value={`${todayMetrics.transactions || 0}`} icon={ShoppingCart} />
                  <StatCard title="Produk Terjual" value={`${todayMetrics.newItemsSoldCount || 0}`} icon={Coffee} description="Jumlah jenis produk unik yang terjual hari ini."/>
              </div>
          </CardContent>
      </Card>

      {/* Action Items Section */}
      {lowStockItems.length > 0 && (
           <Alert variant="destructive">
              <PackageSearch className="h-4 w-4" />
              <AlertTitle>Butuh Perhatian Segera!</AlertTitle>
              <AlertDescription>
                  Beberapa bahan baku stoknya menipis dan perlu segera dipesan ulang:
                   <ul className="list-disc pl-5 mt-2">
                      {lowStockItems.map(item => (
                          <li key={item.id}>
                              <strong>{item.name}</strong> - Sisa {item.totalQuantity} {item.unit}
                          </li>
                      ))}
                  </ul>
              </AlertDescription>
          </Alert>
      )}

      {/* Quick Insights & Deep Dive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 space-y-8">
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Lightbulb />Analisis Mendalam</CardTitle>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardDescription>Pilih periode untuk melihat tren penjualan dan perbandingan.</CardDescription>
                          <Select value={filter} onValueChange={setFilter}>
                              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                              <SelectContent>
                              <SelectItem value="today">Hari Ini</SelectItem><SelectItem value="this_week">Minggu Ini</SelectItem>
                              <SelectItem value="this_month">Bulan Ini</SelectItem><SelectItem value="last_7_days">7 Hari Terakhir</SelectItem>
                              <SelectItem value="last_30_days">30 Hari Terakhir</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <StatCard title="Total Pendapatan" value={formatCurrency(periodMetrics.totalRevenue || 0)} icon={DollarSign} description={`Periode: ${formatDate(dateRange?.current.from?.toISOString() || '', 'dd MMM')} - ${formatDate(dateRange?.current.to?.toISOString() || '', 'dd MMM yyyy')}`}/>
                          <StatCard title="Harga Pokok Penjualan" value={formatCurrency(periodMetrics.totalHpp || 0)} icon={TrendingDown} description="Total HPP dari produk terjual."/>
                          <StatCard title="Laba Bersih" value={formatCurrency(periodMetrics.netProfit || 0)} icon={TrendingUp} description="Setelah dikurangi HPP & biaya operasional."/>
                      </div>
                       {salesChartData.length > 1 ? (
                          <ChartContainer config={lineChartConfig} className="min-h-[300px] w-full">
                              <LineChart accessibilityLayer data={salesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => { const num = Number(value); if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`; if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`; return `${num}`; }} />
                              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                              <Legend content={<ChartLegendContent />} />
                              <Line dataKey="Pendapatan" type="monotone" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                              <Line dataKey="Periode Sebelumnya" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                              </LineChart>
                          </ChartContainer>
                          ) : (
                          <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-4"><LineChartIcon className="w-12 h-12 mb-2"/><p className="font-semibold">Data tidak cukup.</p><p className="text-sm">Pilih rentang waktu yang lebih panjang atau catat lebih banyak penjualan.</p></div>
                      )}
                  </CardContent>
              </Card>
          </div>
          <div className="lg:col-span-2">
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Clock /> Analisis Waktu Sibuk</CardTitle>
                      <CardDescription>Pendapatan per jam pada periode terpilih.</CardDescription>
                  </CardHeader>
                   <CardContent>
                      {peakHoursData.length > 0 ? (
                        <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={peakHoursData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => { const num = Number(value); if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`; if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`; return `${num}`; }} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
                            </BarChart>
                        </ChartContainer>
                      ) : (
                         <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-4"><Clock className="w-12 h-12 mb-2"/><p className="font-semibold">Belum ada penjualan.</p><p className="text-sm">Data akan muncul di sini setelah ada transaksi.</p></div>
                      )}
                  </CardContent>
              </Card>
          </div>
          <div className="lg:col-span-1">
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Award /> Produk Paling Menguntungkan</CardTitle>
                      <CardDescription>Berdasarkan laba bersih pada periode terpilih.</CardDescription>
                  </CardHeader>
                   <CardContent>
                      {topProfitableProducts.length > 0 ? (
                      <ul className="space-y-4">
                          {topProfitableProducts.map((product) => (
                              <li key={product.name} className="flex items-center gap-4">
                                  <div className="p-2 bg-muted rounded-md">
                                      {product.type === 'drink' ? <GlassWater className="h-5 w-5 text-primary"/> : <Utensils className="h-5 w-5 text-primary"/>}
                                  </div>
                                  <div className="flex-1">
                                      <p className="font-semibold">{product.name}</p>
                                      <p className="text-sm text-muted-foreground">{formatCurrency(product.revenue)} pendapatan</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-primary">{formatCurrency(product.profit)}</p>
                                    <p className="text-xs text-muted-foreground">Laba</p>
                                  </div>
                              </li>
                          ))}
                      </ul>
                      ) : (
                      <div className="h-[200px] flex items-center justify-center text-center text-muted-foreground p-4">
                         <p>Belum ada produk terjual pada periode ini.</p>
                      </div>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>
      
      {/* Financial Management Section */}
      <OperasionalManager />

    </div>
  );
}
