// src/components/analisa/operasional-manager.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Edit, Trash2, TrendingDown, Coins } from "lucide-react";

import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OperationalCost } from '@/lib/types';


const costSchema = z.object({
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  amount: z.coerce.number().min(1, "Jumlah biaya harus lebih dari 0"),
  recurrence: z.enum(['sekali', 'harian', 'mingguan', 'bulanan']),
});
type CostFormValues = z.infer<typeof costSchema>;

const recurrenceLabels: Record<OperationalCost['recurrence'], string> = {
  sekali: 'Sekali Bayar', harian: 'Harian', mingguan: 'Mingguan', bulanan: 'Bulanan',
};

export const OperasionalManager = () => {
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
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Coins className="h-6 w-6 text-primary" /> Manajemen Keuangan</CardTitle>
              <CardDescription>Kelola semua arus kas dan biaya bisnis. Gunakan fitur ini untuk mencatat semua biaya besar seperti gaji, sewa, listrik, dll.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
                <Card className="bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Biaya Operasional Tercatat</CardTitle>
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
            </CardContent>
        </Card>
    );
}
