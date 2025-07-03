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
import type { OperationalCost } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

const costSchema = z.object({
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  amount: z.coerce.number().min(1, "Jumlah biaya harus lebih dari 0"),
});

type CostFormValues = z.infer<typeof costSchema>;

export default function OperasionalPage() {
  const { operationalCosts, addOperationalCost, updateOperationalCost, deleteOperationalCost } = useAppContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);
  const { toast } = useToast();

  const form = useForm<CostFormValues>({
    resolver: zodResolver(costSchema),
    defaultValues: { description: "", amount: 0 },
  });

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
    form.reset(cost);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingCost(null);
    form.reset({ description: "", amount: 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteOperationalCost(id);
       if (!result.ok) {
        throw new Error(result.message);
      }
      toast({ title: "Sukses", description: result.message, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
           <h1 className="text-2xl font-semibold">Manajemen Biaya Operasional</h1>
           <Dialog open={isDialogOpen} onOpenChange={(open) => {
             setDialogOpen(open);
             if (!open) {
                form.reset();
                setEditingCost(null);
             }
           }}>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Biaya
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCost ? "Edit Biaya" : "Tambah Biaya Baru"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Biaya</FormLabel>
                        <FormControl><Input {...field} placeholder="cth: Gaji Karyawan" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah (Rp)</FormLabel>
                        <FormControl><Input type="number" {...field} placeholder="cth: 1500000" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">{editingCost ? "Simpan Perubahan" : "Tambah"}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Biaya Operasional</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operationalCosts.length > 0 ? (
                  operationalCosts.map(cost => (
                    <TableRow key={cost.id}>
                      <TableCell>{formatDate(cost.date, "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-medium">{cost.description}</TableCell>
                      <TableCell>{formatCurrency(cost.amount)}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(cost)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(cost.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada biaya operasional.
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
