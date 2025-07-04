
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import type { RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

const defaultFormValues: MaterialFormValues = { 
  name: "", 
  unit: "", 
  totalQuantity: 1, 
  totalCost: 0, 
  category: 'main', 
  sellingPrice: 0 
};

export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: defaultFormValues,
  });
  
  const watchedCategory = form.watch("category");
  const watchedTotalQuantity = form.watch("totalQuantity");
  const watchedTotalCost = form.watch("totalCost");

  const costPerUnit = (watchedTotalCost && watchedTotalQuantity > 0) ? watchedTotalCost / watchedTotalQuantity : 0;
  
  useEffect(() => {
    if (isOpen) {
      if (watchedCategory === 'topping' || watchedCategory === 'packaging') {
        form.setValue('sellingPrice', costPerUnit, { shouldValidate: true });
      }
    }
  }, [costPerUnit, watchedCategory, form.setValue, form, isFormVisible]);

  async function onSubmit(values: MaterialFormValues) {
    try {
      const costPerUnitValue = values.totalCost / values.totalQuantity;
      const materialData = { ...values, costPerUnit: costPerUnitValue };

      if (editingMaterial) {
        await updateRawMaterial(editingMaterial.id, materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil diperbarui." });
      } else {
        await addRawMaterial(materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      }
      setFormVisible(false);
      setEditingMaterial(null);
      form.reset(defaultFormValues);
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
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleAddNew = () => {
    setEditingMaterial(null);
    form.reset(defaultFormValues);
    setFormVisible(true);
  };
  
  const handleCancel = () => {
      setFormVisible(false);
      setEditingMaterial(null);
      form.reset(defaultFormValues);
  }

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
          <Button onClick={() => {
            if (isFormVisible) {
                handleCancel();
            } else {
                handleAddNew();
            }
          }}>
            <PlusCircle className="mr-2 h-4 w-4" /> 
            {isFormVisible ? "Tutup Form" : "Tambah Bahan Baku"}
          </Button>
      </div>

      {isFormVisible && (
          <Card>
            <CardHeader>
              <CardTitle>{editingMaterial ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</CardTitle>
              <CardDescription>
                Masukkan data sesuai pembelian terakhir Anda. Harga per satuan akan dihitung otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    
                    <Separator />
                    
                    <div className="p-4 rounded-md bg-muted">
                        <Label>Harga Pokok per Satuan (HPP)</Label>
                        <p className="font-bold text-2xl text-primary">{formatCurrency(costPerUnit || 0)}</p>
                        <FormDescription>Dihitung otomatis dari: Total Biaya / Jumlah Beli.</FormDescription>
                    </div>
                    
                    {(watchedCategory === 'topping' || watchedCategory === 'packaging') && (
                       <FormField
                        control={form.control}
                        name="sellingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Harga Jual (Rp)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value || 0}
                                    readOnly={true}
                                    className="bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </FormControl>
                            <FormDescription>Otomatis disamakan dengan HPP. Anda tidak mengambil profit dari item ini.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div className="flex items-center gap-2">
                        <Button type="submit">{editingMaterial ? "Simpan Perubahan" : "Tambah"}</Button>
                        {editingMaterial && (
                          <Button variant="ghost" type="button" onClick={handleCancel}>Batal Edit</Button>
                        )}
                    </div>
                  </form>
                </Form>
            </CardContent>
          </Card>
      )}

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
                      {(material.category === 'topping' || material.category === 'packaging') && typeof material.sellingPrice === 'number' ? formatCurrency(material.sellingPrice) : '—'}
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

    