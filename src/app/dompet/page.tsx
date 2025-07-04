"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { isSameDay, startOfToday, parseISO } from "date-fns";
import { Wallet, DollarSign, ArrowDownCircle, ArrowUpCircle, Plus, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/main-layout";

export default function DompetPage() {
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
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Dompet Hari Ini</CardTitle>
            <CardDescription>Perhitungan otomatis berdasarkan penjualan dan pengeluaran tunai hari ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Modal Awal</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(initialCapital)}</div></CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Penjualan Tunai</CardTitle><ArrowUpCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pengeluaran Tunai</CardTitle><ArrowDownCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div></CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Uang di Laci</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(cashInDrawer)}</div></CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kelola Kas</CardTitle>
            <CardDescription>Atur modal awal untuk hari ini dan catat pengeluaran tunai.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="initialCapital">Modal Awal</Label>
              <div className="flex gap-2">
                <Input id="initialCapital" type="number" value={newCapital} onChange={(e) => setNewCapital(e.target.value)} placeholder="Jumlah modal awal" />
                <Button onClick={handleSetCapital}>Atur</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Catat Pengeluaran Tunai</h4>
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
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
