
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency, cn } from "@/lib/utils";
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
  subMonths,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { MainLayout } from "@/components/main-layout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, Legend } from "recharts";
import { calculateSaleHpp } from "@/lib/data-logic";
import { ArrowDown, ArrowUp, BarChartHorizontal, DollarSign, LineChart as LineChartIcon, ShoppingCart, TrendingDown } from "lucide-react";

// --- Helper Component for KPI Cards ---
const KpiCard = ({ title, value, change, period, icon: Icon }: {
  title: string;
  value: string;
  change: number | null;
  period: string;
  icon: React.ElementType;
}) => {
  const isPositive = change !== null && change >= 0;
  const isNegative = change !== null && change < 0;

  // For HPP and OpCost, "up" is bad (red), "down" is good (green).
  const isChangeGood = title.includes("HPP") || title.includes("Biaya") ? isNegative : isPositive;
  const isChangeBad = title.includes("HPP") || title.includes("Biaya") ? isPositive : isNegative;


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change !== null && change !== Infinity ? (
            <div className={cn(
              "flex items-center gap-1",
              isChangeGood && "text-emerald-500",
              isChangeBad && "text-destructive"
            )}>
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(change).toFixed(1)}%
            </div>
          ) : (
             <span className="flex items-center gap-1">-</span>
          )}
          <span className="ml-1">vs {period}</span>
        </div>
      </CardContent>
    </Card>
  );
};


export default function DashboardPage() {
  const { sales, drinks, foods, operationalCosts, rawMaterials } = useAppContext();
  const [filter, setFilter] = useState<string>("last_7_days");
  const [dateRange, setDateRange] = useState<{ current: DateRange; previous: DateRange } | null>(null);

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
        previousTo = endOfMonth(subMonths(now, 1));
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
    currentMetrics,
    previousMetrics,
    topProducts,
    salesChartData
  } = useMemo(() => {
    if (!dateRange) return { currentMetrics: {}, previousMetrics: {}, topProducts: [], salesChartData: [] };

    const calculateMetricsForPeriod = (period: DateRange) => {
      const periodSales = sales.filter(item => {
        try {
          return isWithinInterval(parseISO(item.date), { start: period.from!, end: period.to! });
        } catch { return false; }
      });

      let revenue = 0;
      let cost = 0;

      periodSales.forEach(sale => {
        revenue += sale.totalSalePrice || 0;
        cost += calculateSaleHpp(sale, drinks, foods, rawMaterials);
      });

      const oneTimeOpCosts = operationalCosts
        .filter(c => c.recurrence === 'sekali' && isWithinInterval(parseISO(c.date), { start: period.from!, end: period.to! }))
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      const recurringDailyRate = operationalCosts
        .filter(c => c.recurrence !== 'sekali' && parseISO(c.date) <= period.to!)
        .reduce((sum, c) => {
          const amount = c.amount || 0;
          if (c.recurrence === 'harian') return sum + amount;
          if (c.recurrence === 'mingguan') return sum + (amount / 7);
          if (c.recurrence === 'bulanan') return sum + (amount / 30);
          return sum;
        }, 0);

      const numberOfDays = differenceInDays(period.to!, period.from!) + 1;
      const totalRecurringCost = recurringDailyRate * numberOfDays;
      const finalOperationalCost = oneTimeOpCosts + totalRecurringCost;
      const netProfit = revenue - cost - finalOperationalCost;

      return { totalRevenue: revenue, totalCost: cost, totalOperationalCost: finalOperationalCost, netProfit };
    };

    const currentMetrics = calculateMetricsForPeriod(dateRange.current);
    const previousMetrics = calculateMetricsForPeriod(dateRange.previous);

    // Calculate Top Products for current period only
    const salesByProduct: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    sales.filter(item => isWithinInterval(parseISO(item.date), { start: dateRange.current.from!, end: dateRange.current.to! }))
      .forEach(sale => {
        const product = sale.productType === 'drink'
          ? drinks.find(d => d.id === sale.productId)
          : foods.find(f => f.id === sale.productId);
        if (product) {
          const productName = product.name;
          if (!salesByProduct[productName]) {
            salesByProduct[productName] = { name: productName, quantity: 0, revenue: 0 };
          }
          salesByProduct[productName].quantity += sale.quantity || 0;
          salesByProduct[productName].revenue += sale.totalSalePrice || 0;
        }
      });
    const topProducts = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Prepare data for line chart
    const currentSalesMap = new Map<string, number>();
    sales.filter(s => isWithinInterval(parseISO(s.date), { start: dateRange.current.from!, end: dateRange.current.to! }))
      .forEach(s => {
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

    return { currentMetrics, previousMetrics, topProducts, salesChartData: chartData };
  }, [dateRange, sales, drinks, foods, operationalCosts, rawMaterials]);

  const getChange = (current: number, previous: number): number | null => {
    if (previous === 0) return current > 0 ? Infinity : 0;
    if (current === 0 && previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const revenueChange = getChange(currentMetrics.totalRevenue || 0, previousMetrics.totalRevenue || 0);
  const hppChange = getChange(currentMetrics.totalCost || 0, previousMetrics.totalCost || 0);
  const opCostChange = getChange(currentMetrics.totalOperationalCost || 0, previousMetrics.totalOperationalCost || 0);
  const profitChange = getChange(currentMetrics.netProfit || 0, previousMetrics.netProfit || 0);

  const filterPeriodMap: { [key: string]: string } = {
    today: 'kemarin',
    this_week: 'minggu lalu',
    this_month: 'bulan lalu',
    last_7_days: '7 hari sebelumnya',
    last_30_days: '30 hari sebelumnya',
  };

  const lineChartConfig = {
    Pendapatan: { label: "Pendapatan", color: "hsl(var(--chart-1))" },
    'Periode Sebelumnya': { label: "Periode Sebelumnya", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;
  
  const barChartConfig = {
    revenue: {
      label: "Pendapatan",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dasbor Analitik</h1>
                <p className="text-muted-foreground">Tinjauan performa bisnis Anda.</p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Pendapatan" value={formatCurrency(currentMetrics.totalRevenue || 0)} change={revenueChange} period={filterPeriodMap[filter]} icon={DollarSign} />
          <KpiCard title="Total HPP" value={formatCurrency(currentMetrics.totalCost || 0)} change={hppChange} period={filterPeriodMap[filter]} icon={ShoppingCart} />
          <KpiCard title="Biaya Operasional" value={formatCurrency(currentMetrics.totalOperationalCost || 0)} change={opCostChange} period={filterPeriodMap[filter]} icon={TrendingDown} />
          <KpiCard title="Laba Bersih" value={formatCurrency(currentMetrics.netProfit || 0)} change={profitChange} period={filterPeriodMap[filter]} icon={DollarSign} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren Pendapatan Harian</CardTitle>
              <CardDescription>Perbandingan pendapatan harian dengan periode sebelumnya.</CardDescription>
            </CardHeader>
            <CardContent>
              {salesChartData.length > 1 ? (
                <ChartContainer config={lineChartConfig} className="min-h-[300px] w-full">
                  <LineChart accessibilityLayer data={salesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => {
                         const num = Number(value);
                         if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
                         if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
                         return `${num}`;
                    }} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Legend />
                    <Line dataKey="Pendapatan" type="monotone" stroke="var(--color-Pendapatan)" strokeWidth={2} dot={false} />
                    <Line dataKey="Periode Sebelumnya" type="monotone" stroke="var(--color-Periode Sebelumnya)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <LineChartIcon className="w-12 h-12 mb-2"/>
                  <p className="font-semibold">Data tidak cukup untuk menampilkan grafik tren.</p>
                  <p className="text-sm">Pilih rentang waktu yang lebih panjang atau catat lebih banyak penjualan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
              <CardDescription>Berdasarkan pendapatan pada periode terpilih.</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ChartContainer config={barChartConfig} className="min-h-[340px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={topProducts}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            width={110}
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <XAxis dataKey="revenue" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="grid gap-1.5 rounded-lg border bg-background p-2.5 text-sm shadow-sm">
                                    <div className="font-bold">{data.name}</div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Pendapatan:</span>
                                      <span className="font-medium">{formatCurrency(data.revenue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Terjual:</span>
                                      <span className="font-medium">{data.quantity} pcs</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                        />
                        <Bar dataKey="revenue" layout="vertical" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
              ) : (
                 <div className="h-[340px] flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <BarChartHorizontal className="w-12 h-12 mb-2"/>
                  <p className="font-semibold">Tidak ada produk terjual.</p>
                  <p className="text-sm">Data produk terlaris akan muncul di sini.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
