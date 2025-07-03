"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import type { Drink } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

const drinkSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama minuman tidak boleh kosong"),
  costPrice: z.coerce.number().min(0, "Harga pokok tidak boleh negatif"),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
});

export default function MinumanPage() {
  const { drinks, fetchData } = useAppContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof drinkSchema>>({
    resolver: zodResolver(drinkSchema),
    defaultValues: { name: "", costPrice: 0, sellingPrice: 0 },
  });

  async function onSubmit(values: z.infer<typeof drinkSchema>) {
    const { id, ...payload } = values;
    const url = editingDrink ? `/api/drinks/${editingDrink.id}` : '/api/drinks';
    const method = editingDrink ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal menyimpan data minuman');

      await fetchData();
      toast({ title: "Sukses", description: `Minuman berhasil ${editingDrink ? 'diperbarui' : 'ditambahkan'}.` });
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink);
    form.reset(drink);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingDrink(null);
    form.reset({ name: "", costPrice: 0, sellingPrice: 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/drinks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus minuman');
      
      await fetchData();
      toast({ title: "Sukses", description: "Minuman berhasil dihapus.", variant: "destructive" });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Manajemen Minuman</h1>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
             setDialogOpen(open);
             if (!open) {
                form.reset();
                setEditingDrink(null);
             }
           }}>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Minuman
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDrink ? "Edit Minuman" : "Tambah Minuman Baru"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Minuman</FormLabel>
                        <FormControl><Input {...field} placeholder="cth: Es Kopi Susu" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Pokok</FormLabel>
                        <FormControl><Input type="number" {...field} placeholder="cth: 4000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual</FormLabel>
                        <FormControl><Input type="number" {...field} placeholder="cth: 18000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">{editingDrink ? "Simpan Perubahan" : "Tambah"}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Minuman</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Minuman</TableHead>
                  <TableHead>Harga Pokok</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drinks.length > 0 ? (
                  drinks.map(drink => (
                    <TableRow key={drink.id}>
                      <TableCell className="font-medium">{drink.name}</TableCell>
                      <TableCell>{formatCurrency(drink.costPrice)}</TableCell>
                      <TableCell>{formatCurrency(drink.sellingPrice)}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(drink)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(drink.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada data minuman.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
