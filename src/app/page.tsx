"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Drink, Sale } from "@/lib/types";
import { format, isToday, parseISO } from "date-fns";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function DashboardPage() {
  const [sales] = useLocalStorage<Sale[]>("sales", []);
  const [drinks] = useLocalStorage<Drink[]>("drinks", []);

  const todaySales = sales.filter(sale => isToday(parseISO(sale.date)));

  const totalRevenue = todaySales.reduce((sum, sale) => {
    const drink = drinks.find(d => d.id === sale.drinkId);
    return sum + (drink?.sellingPrice || 0) * sale.quantity * (1 - sale.discount / 100);
  }, 0);

  const totalCost = todaySales.reduce((sum, sale) => {
    const drink = drinks.find(d => d.id === sale.drinkId);
    return sum + (drink?.costPrice || 0) * sale.quantity;
  }, 0);

  const netProfit = totalRevenue - totalCost;

  const salesByDrink = todaySales.reduce((acc, sale) => {
    const drink = drinks.find(d => d.id === sale.drinkId);
    if (drink) {
      acc[drink.name] = (acc[drink.name] || 0) + sale.quantity;
    }
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(salesByDrink)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Pendapatan (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Biaya (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Laba Bersih (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatCurrency(netProfit)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Minuman Terlaris Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} cups`} />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terkini</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Minuman</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySales.slice(0, 5).map(sale => {
                    const drink = drinks.find(d => d.id === sale.drinkId);
                    const total = (drink?.sellingPrice || 0) * sale.quantity * (1 - sale.discount / 100);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>{drink?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{formatCurrency(total)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
