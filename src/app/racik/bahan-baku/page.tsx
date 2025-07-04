
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import type { RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

const materialSchema = z.object({
  name: z.string().min(1, "Nama bahan tidak boleh kosong"),
  unit: z.string().min(1, "Satuan untuk resep tidak boleh kosong"),
  totalQuantity: z.coerce.number().min(0.001, "Jumlah pembelian harus lebih dari 0"),
  totalCost: z.coerce.number().min(0, "Total biaya tidak boleh negatif"),
  category: z.enum(['main', 'packaging', 'topping'], {
    required_error: "Kategori harus dipilih",
  }),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif").optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const categoryLabels: Record<RawMaterial['category'], string> = {
  main: 'Utama',
  packaging: 'Kemasan',
  topping: 'Topping'
};

export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: { name: "", unit: "", totalQuantity: 1, totalCost: 0, category: 'main', sellingPrice: 0 },
  });
  
  const watchedCategory = form.watch("category");

  async function onSubmit(values: MaterialFormValues) {
    try {
      const costPerUnit = values.totalCost / values.totalQuantity;
      const materialData = { ...values, costPerUnit };

      if (editingMaterial) {
        await updateRawMaterial(editingMaterial.id, materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil diperbarui." });
      } else {
        await addRawMaterial(materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    form.reset({
      name: material.name,
      unit: material.unit,
      totalQuantity: material.totalQuantity,
      totalCost: material.totalCost,
      category: material.category || 'main',
      sellingPrice: material.sellingPrice || 0,
    });
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMaterial(null);
    form.reset({ name: "", unit: "", totalQuantity: 1, totalCost: 0, category: 'main', sellingPrice: 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus bahan baku ini? Menghapus bahan ini akan memengaruhi HPP pada resep yang ada, namun tidak mengubah data penjualan yang sudah tercatat.")) return;
    try {
      const result = await deleteRawMaterial(id);
      if (!result.ok) {
        throw new Error(result.message);
      }
      toast({ title: "Sukses", description: result.message });
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Manajemen Bahan Baku</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
           setDialogOpen(open);
           if (!open) {
              form.reset();
              setEditingMaterial(null);
           }
         }}>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Bahan Baku
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
              <DialogDescription>
                Masukkan data sesuai pembelian terakhir Anda. Harga per satuan akan dihitung otomatis.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bahan</FormLabel>
                      <FormControl><Input {...field} placeholder="cth: Biji Kopi Arabika" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satuan Resep</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih satuan..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gram">gram</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="liter">liter</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="buah">buah</SelectItem>
                          <SelectItem value="botol">botol</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Satuan yang akan Anda gunakan saat membuat resep.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Bahan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">Bahan Utama</SelectItem>
                            <SelectItem value="topping">Topping / Tambahan</SelectItem>
                            <SelectItem value="packaging">Kemasan / Packaging</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Klasifikasi bahan untuk resep dan kustomisasi.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Beli</FormLabel>
                        <FormControl><Input type="number" step="any" {...field} placeholder="cth: 1000" /></FormControl>
                        <FormDescription>Jumlah dalam satuan resep di atas.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Biaya (Rp)</FormLabel>
                        <FormControl><Input type="number" {...field} placeholder="cth: 200000" /></FormControl>
                         <FormDescription>Total harga pembelian.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {watchedCategory === 'topping' && (
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Jual Topping (Rp)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} placeholder="cth: 3000" /></FormControl>
                        <FormDescription>Harga yang dibayar pelanggan untuk tambahan topping ini.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit">{editingMaterial ? "Simpan Perubahan" : "Tambah"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Bahan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Detail Biaya</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.length > 0 ? (
                rawMaterials.map(material => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{categoryLabels[material.category] || 'Utama'}</TableCell>
                    <TableCell>
                      {formatCurrency(material.totalCost)} / {material.totalQuantity} {material.unit}
                      <p className="text-xs text-muted-foreground">({formatCurrency(material.costPerUnit)} per {material.unit})</p>
                    </TableCell>
                    <TableCell>
                      {material.category === 'topping' && material.sellingPrice ? formatCurrency(material.sellingPrice) : 'N/A'}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(material)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(material.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada data bahan baku.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
    