"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Drink, Sale } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const saleSchema = z.object({
  drinkId: z.string().min(1, "Silakan pilih minuman"),
  quantity: z.coerce.number().min(1, "Jumlah harus minimal 1"),
  discount: z.coerce.number().min(0, "Diskon tidak boleh negatif").max(100, "Diskon maksimal 100%").default(0),
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function PenjualanPage() {
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);
  const [drinks] = useLocalStorage<Drink[]>("drinks", []);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 1, discount: 0 },
  });

  function onSubmit(values: z.infer<typeof saleSchema>) {
    const newSale: Sale = {
      ...values,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
    };
    setSales([newSale, ...sales]);
    toast({ title: "Sukses", description: "Penjualan berhasil dicatat." });
    form.reset({ drinkId: undefined, quantity: 1, discount: 0 });
  }

  return (
    <MainLayout>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Catat Penjualan Baru</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="drinkId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minuman</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih minuman" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drinks.map(drink => (
                              <SelectItem key={drink.id} value={drink.id}>{drink.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diskon (%)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Catat Penjualan</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Riwayat Penjualan</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Minuman</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Diskon</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(sale => {
                    const drink = drinks.find(d => d.id === sale.drinkId);
                    const total = drink ? drink.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0;
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>{format(parseISO(sale.date), "dd MMM yyyy, HH:mm")}</TableCell>
                        <TableCell>{drink?.name || 'N/A'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{sale.discount}%</TableCell>
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
