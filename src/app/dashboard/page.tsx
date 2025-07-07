
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
import { formatCurrency, formatDate, cn } from "@/lib/utils";
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
  getHours,
  isSameDay
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { MainLayout } from "@/components/main-layout";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, Legend, Pie, PieChart, Cell } from "recharts";
import { calculateSaleHpp, calculateOperationalCostForPeriod } from "@/lib/data-logic";
import { ArrowDown, ArrowUp, BarChartHorizontal, DollarSign, LineChart as LineChartIcon, ShoppingCart, Clock, PieChart as PieChartIcon, Receipt, AlertTriangle, PackageX, Wallet, ArrowDownCircle, ArrowUpCircle, Plus, PlusCircle, Edit, Trash2, TrendingDown, Coins, Target, Utensils, GlassWater, Lightbulb, PackageSearch, Coffee } from "lucide-react";
import type { OperationalCost, Sale, CashExpense, RawMaterial } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// --- KPI Card Component ---
const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType; description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
);


// --- Financial Management Components (Integrated from Dompet) ---

const costSchema = z.object({
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  amount: z.coerce.number().min(1, "Jumlah biaya harus lebih dari 0"),
  recurrence: z.enum(['sekali', 'harian', 'mingguan', 'bulanan']),
});
type CostFormValues = z.infer<typeof costSchema>;
const recurrenceLabels: Record<OperationalCost['recurrence'], string> = {
  sekali: 'Sekali Bayar', harian: 'Harian', mingguan: 'Mingguan', bulanan: 'Bulanan',
};

// Kas Harian Component
const KasHarianManager = () => {
    const { sales, initialCapital, setInitialCapital, cashExpenses, addCashExpense, deleteCashExpense } = useAppContext();
    const { toast } = useToast();

    const [newCapital, setNewCapital] = useState(initialCapital.toString());
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    useEffect(() => {
        setNewCapital(initialCapital.toString());
    }, [initialCapital]);

    const today = startOfToday();
    const todaysSales = sales.filter(s => isSameDay(parseISO(s.date), today));
    const todaysCashExpenses = cashExpenses.filter(e => isSameDay(parseISO(e.date), today));

    const totalRevenue = todaysSales.reduce((sum, s) => sum + s.totalSalePrice, 0);
    const totalExpenses = todaysCashExpenses.reduce((sum, e) => sum + e.amount, 0);
    const cashInDrawer = initialCapital + totalRevenue - totalExpenses;

    const handleSetCapital = () => {
        const amount = parseFloat(newCapital);
        if (isNaN(amount) || amount < 0) {
        toast({ title: 'Error', description: 'Modal awal tidak valid.', variant: 'destructive' });
        return;
        }
        setInitialCapital(amount);
        toast({ title: 'Sukses', description: 'Modal awal berhasil diatur.' });
    }

    const handleAddExpense = () => {
        const amount = parseFloat(expenseAmount);
        if (!expenseDesc.trim() || isNaN(amount) || amount <= 0) {
        toast({ title: 'Error', description: 'Deskripsi atau jumlah pengeluaran tidak valid.', variant: 'destructive' });
        return;
        }
        addCashExpense({ description: expenseDesc, amount });
        toast({ title: 'Sukses', description: 'Pengeluaran tunai berhasil dicatat.' });
        setExpenseDesc('');
        setExpenseAmount('');
    }

    const handleDeleteExpense = (id: string) => {
        if (window.confirm("Yakin ingin menghapus pengeluaran ini?")) {
        deleteCashExpense(id);
        toast({ title: 'Sukses', description: 'Pengeluaran berhasil dihapus.' });
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle>Ringkasan Kas Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Modal Awal</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(initialCapital)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Penjualan Tunai</CardTitle><ArrowUpCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pengeluaran Tunai</CardTitle><ArrowDownCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div></CardContent></Card>
                        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Uang di Laci</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(cashInDrawer)}</div></CardContent></Card>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="initialCapital">Modal Awal</Label>
                    <div className="flex gap-2">
                    <Input id="initialCapital" type="number" value={newCapital} onChange={(e) => setNewCapital(e.target.value)} placeholder="Jumlah modal awal" />
                    <Button onClick={handleSetCapital}>Atur</Button>
                    </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h4 className="font-medium">Catat Pengeluaran Tunai Harian</h4>
                     <p className="text-sm text-muted-foreground">Catat pengeluaran kecil yang dibayar tunai (cth: beli es batu, parkir). Biaya operasional besar seperti gaji atau sewa harus dicatat di tab "Biaya Operasional".</p>
                    <div className="grid sm:grid-cols-3 gap-2">
                    <Input value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Deskripsi (cth: Beli es batu)" className="sm:col-span-2" />
                    <Input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} type="number" placeholder="Jumlah (Rp)" />
                    </div>
                    <Button onClick={handleAddExpense}><Plus className="mr-2" /> Tambah Pengeluaran</Button>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium">Riwayat Pengeluaran Hari Ini</h4>
                    <div className="border rounded-md">
                    <Table>
                        <TableHeader><TableRow><TableHead>Deskripsi</TableHead><TableHead className="text-right">Jumlah</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                        <TableBody>
                        {todaysCashExpenses.length > 0 ? todaysCashExpenses.map(exp => (
                            <TableRow key={exp.id}>
                                <TableCell>{exp.description}</TableCell>
                                <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada pengeluaran hari ini.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Operasional Manager Component
const OperasionalManager = () => {
    const { operationalCosts, addOperationalCost, updateOperationalCost, deleteOperationalCost } = useAppContext();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);
    const { toast } = useToast();

    const form = useForm<CostFormValues>({
        resolver: zodResolver(costSchema),
        defaultValues: { description: "", amount: 0, recurrence: "sekali" },
    });

    const totalOperationalCost = useMemo(() => {
        return operationalCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    }, [operationalCosts]);

    async function onSubmit(values: CostFormValues) {
        try {
        if (editingCost) {
            await updateOperationalCost(editingCost.id, values);
            toast({ title: "Sukses", description: `Biaya operasional berhasil diperbarui.` });
        } else {
            await addOperationalCost(values);
            toast({ title: "Sukses", description: `Biaya operasional berhasil ditambahkan.` });
        }
        setDialogOpen(false);
        } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }

    const handleEdit = (cost: OperationalCost) => {
        setEditingCost(cost);
        form.reset({
        description: cost.description, amount: cost.amount, recurrence: cost.recurrence || 'sekali'
        });
        setDialogOpen(true);
    };
    
    const handleAddNew = () => {
        setEditingCost(null);
        form.reset({ description: "", amount: 0, recurrence: "sekali" });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus biaya ini?")) return;
        try {
        const result = await deleteOperationalCost(id);
        if (!result.ok) throw new Error(result.message);
        toast({ title: "Sukses", description: result.message });
        } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };
  
    return (
        <div className="space-y-6">
            <Card className="bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Biaya Operasional</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalOperationalCost)}</div>
                <p className="text-xs text-muted-foreground">Total dari semua biaya yang tercatat (tidak termasuk HPP).</p>
            </CardContent>
            </Card>

            <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-semibold text-lg">Daftar Biaya Operasional</h3>
                        <p className="text-sm text-muted-foreground">Catat semua biaya non-produksi di sini (cth: gaji, sewa, listrik).</p>
                    </div>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Biaya</Button>
                </div>
                <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Deskripsi</TableHead><TableHead>Jenis</TableHead><TableHead>Jumlah</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {operationalCosts.length > 0 ? (
                    operationalCosts.map(cost => (
                        <TableRow key={cost.id}>
                        <TableCell>{formatDate(cost.date, "dd MMM yyyy")}</TableCell>
                        <TableCell className="font-medium">{cost.description}</TableCell>
                        <TableCell>{recurrenceLabels[cost.recurrence] || 'Sekali Bayar'}</TableCell>
                        <TableCell>{formatCurrency(cost.amount)}</TableCell>
                        <TableCell className="flex gap-2 justify-end">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(cost)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(cost.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Belum ada biaya operasional.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) { form.reset(); setEditingCost(null); }
              }}>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingCost ? "Edit Biaya" : "Tambah Biaya Baru"}</DialogTitle></DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Deskripsi Biaya</FormLabel><FormControl><Input {...field} placeholder="cth: Gaji Karyawan" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Jumlah (Rp)</FormLabel><FormControl><Input type="number" {...field} placeholder="cth: 1500000" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="recurrence" render={({ field }) => (<FormItem><FormLabel>Jenis Tagihan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis tagihan" /></SelectTrigger></FormControl><SelectContent><SelectItem value="sekali">Sekali Bayar</SelectItem><SelectItem value="harian">Harian</SelectItem><SelectItem value="mingguan">Mingguan</SelectItem><SelectItem value="bulanan">Bulanan</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                      <Button type="submit">{editingCost ? "Simpan Perubahan" : "Tambah"}</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
        </div>
    )
}

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
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
    topProducts,
  } = useMemo(() => {
    if (!dateRange) return { todayMetrics: {}, lowStockItems: [], periodMetrics: {}, salesChartData: [], topProducts: [] };

    // --- Today's Metrics ---
    const todayStart = startOfToday();
    const todaySales = sales.filter(s => isSameDay(parseISO(s.date), todayStart));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalSalePrice, 0);
    const todayTransactions = todaySales.length;
    const soldProductIdsToday = new Set(todaySales.map(s => s.productId));
    const todayNewItemsSoldCount = todaySales.filter(s => !soldProductIdsToday.has(s.productId)).length;

    const todayMetrics = {
        revenue: todayRevenue,
        transactions: todayTransactions,
        newItemsSoldCount: todayNewItemsSoldCount,
        goalProgress: (todayRevenue / DAILY_REVENUE_GOAL) * 100
    };
    
    // --- Alerts ---
    const lowStockItems = rawMaterials.filter(
      (m) => m.lowStockThreshold && m.totalQuantity < m.lowStockThreshold
    );

    // --- Period Metrics (for deep dive) ---
    const calculateMetricsForPeriod = (period: DateRange) => {
        const periodSales = sales.filter(item => isWithinInterval(parseISO(item.date), { start: period.from!, end: period.to! }));
        let revenue = 0;
        let cost = 0;
        periodSales.forEach(sale => {
            revenue += sale.totalSalePrice || 0;
            cost += calculateSaleHpp(sale, drinks, foods, rawMaterials);
        });
        const finalOperationalCost = calculateOperationalCostForPeriod(period, operationalCosts);
        const netProfit = revenue - cost - finalOperationalCost;
        return { totalRevenue: revenue, netProfit };
    };
    const periodMetrics = calculateMetricsForPeriod(dateRange.current);

    // --- Chart Data ---
    const salesByProduct: { [key: string]: { name: string; quantity: number; revenue: number; type: 'drink' | 'food' } } = {};
    const currentPeriodSales = sales.filter(item => isWithinInterval(parseISO(item.date), { start: dateRange.current.from!, end: dateRange.current.to! }));
    currentPeriodSales.forEach(sale => {
        const product = sale.productType === 'drink'
          ? drinks.find(d => d.id === sale.productId)
          : foods.find(f => f.id === sale.productId);
        if (product) {
          if (!salesByProduct[product.id]) {
            salesByProduct[product.id] = { name: product.name, quantity: 0, revenue: 0, type: sale.productType };
          }
          salesByProduct[product.id].quantity += sale.quantity || 0;
          salesByProduct[product.id].revenue += sale.totalSalePrice || 0;
        }
    });
    const topProducts = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);


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

    return { todayMetrics, lowStockItems, periodMetrics, salesChartData: chartData, topProducts };

  }, [dateRange, sales, drinks, foods, operationalCosts, rawMaterials]);


  const lineChartConfig = { Pendapatan: { label: "Pendapatan", color: "hsl(var(--chart-1))" }, 'Periode Sebelumnya': { label: "Periode Sebelumnya", color: "hsl(var(--chart-2))" } } satisfies ChartConfig;
  

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
            <div className="lg:col-span-2 space-y-8">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard title="Total Pendapatan" value={formatCurrency(periodMetrics.totalRevenue || 0)} icon={DollarSign} description={`Periode: ${formatDate(dateRange?.current.from?.toISOString() || '', 'dd MMM')} - ${formatDate(dateRange?.current.to?.toISOString() || '', 'dd MMM yyyy')}`}/>
                            <StatCard title="Laba Bersih" value={formatCurrency(periodMetrics.netProfit || 0)} icon={TrendingDown} description="Setelah dikurangi HPP & biaya operasional."/>
                        </div>
                         {salesChartData.length > 1 ? (
                            <ChartContainer config={lineChartConfig} className="min-h-[300px] w-full">
                                <LineChart accessibilityLayer data={salesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => { const num = Number(value); if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`; if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`; return `${num}`; }} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                                <Legend content={<ChartLegendContent />} />
                                <Line dataKey="Pendapatan" type="monotone" stroke="var(--color-Pendapatan)" strokeWidth={2} dot={false} />
                                <Line dataKey="Periode Sebelumnya" type="monotone" stroke="var(--color-Periode Sebelumnya)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                                </LineChart>
                            </ChartContainer>
                            ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground p-4"><LineChartIcon className="w-12 h-12 mb-2"/><p className="font-semibold">Data tidak cukup.</p><p className="text-sm">Pilih rentang waktu yang lebih panjang atau catat lebih banyak penjualan.</p></div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Produk Terlaris</CardTitle>
                        <CardDescription>Berdasarkan pendapatan pada periode terpilih.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        {topProducts.length > 0 ? (
                        <ul className="space-y-4">
                            {topProducts.map((product) => (
                                <li key={product.name} className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-md">
                                        {product.type === 'drink' ? <GlassWater className="h-5 w-5 text-primary"/> : <Utensils className="h-5 w-5 text-primary"/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{product.quantity}x terjual</p>
                                    </div>
                                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Coins className="h-6 w-6 text-primary" /> Manajemen Keuangan</CardTitle>
                <CardDescription>Kelola semua arus kas dan biaya bisnis. Gunakan 'Kas Harian' untuk pengeluaran tunai kecil (parkir, es batu) dan 'Biaya Operasional' untuk semua biaya besar lainnya (gaji, sewa, listrik).</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="kas_harian">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="kas_harian">Kas Harian</TabsTrigger>
                        <TabsTrigger value="operasional">Biaya Operasional</TabsTrigger>
                    </TabsList>
                    <TabsContent value="kas_harian" className="pt-6">
                        <KasHarianManager />
                    </TabsContent>
                    <TabsContent value="operasional" className="pt-6">
                        <OperasionalManager />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>

      </div>
  );
}
