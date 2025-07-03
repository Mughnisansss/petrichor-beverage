"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { isToday, parseISO } from "date-fns";

export default function DashboardPage() {
  const { sales, drinks } = useAppContext();

  const todaySales = useMemo(() => sales.filter(sale => isToday(parseISO(sale.date))), [sales]);

  const { totalRevenue, totalCost, grossProfit } = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    
    todaySales.forEach(sale => {
      const drink = drinks.find(d => d.id === sale.drinkId);
      if (drink) {
        revenue += drink.sellingPrice * sale.quantity * (1 - sale.discount / 100);
        cost += drink.costPrice * sale.quantity;
      }
    });

    return { totalRevenue: revenue, totalCost: cost, grossProfit: revenue - cost };
  }, [todaySales, drinks]);


  const chartData = useMemo(() => {
    const salesByDrink = todaySales.reduce((acc, sale) => {
      const drink = drinks.find(d => d.id === sale.drinkId);
      if (drink) {
        acc[drink.name] = (acc[drink.name] || 0) + sale.quantity;
      }
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(salesByDrink)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [todaySales, drinks]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>HPP (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Laba Kotor (Hari Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatCurrency(grossProfit)}</p>
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
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    formatter={(value, name) => [`${value} gelas`, "Jumlah Terjual"]}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="quantity" name="Jumlah Terjual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                  {todaySales.length > 0 ? (
                    todaySales.slice(0, 5).map(sale => {
                      const drink = drinks.find(d => d.id === sale.drinkId);
                      const total = (drink?.sellingPrice || 0) * sale.quantity * (1 - sale.discount / 100);
                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{drink?.name || 'N/A'}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Belum ada transaksi hari ini.
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
