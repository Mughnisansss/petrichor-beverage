
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { PlusCircle, Edit, Trash2, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const purchaseSchema = z.object({
  name: z.string().min(1, "Nama bahan tidak boleh kosong"),
  unit: z.string().min(1, "Satuan untuk resep tidak boleh kosong"),
  category: z.enum(['main', 'packaging', 'topping'], { required_error: "Kategori harus dipilih" }),
  purchaseQuantity: z.coerce.number().min(0.001, "Jumlah pembelian harus lebih dari 0"),
  purchaseCost: z.coerce.number().min(0, "Total biaya tidak boleh negatif"),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif").optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const defaultFormValues: PurchaseFormValues = { 
  name: "", 
  unit: "", 
  purchaseQuantity: 1, 
  purchaseCost: 0, 
  category: 'main', 
  sellingPrice: 0 
};

export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
  }, [rawMaterials]);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: defaultFormValues,
  });
  
  const watchedPurchaseQuantity = form.watch("purchaseQuantity");
  const watchedPurchaseCost = form.watch("purchaseCost");
  const watchedCategory = form.watch("category");

  const newPurchaseHpp = useMemo(() => 
    (watchedPurchaseCost && watchedPurchaseQuantity > 0) ? watchedPurchaseCost / watchedPurchaseQuantity : 0,
    [watchedPurchaseQuantity, watchedPurchaseCost]
  );
  
  useEffect(() => {
    if (isFormOpen && (watchedCategory === 'packaging' || watchedCategory === 'main')) {
      form.setValue('sellingPrice', newPurchaseHpp, { shouldValidate: true });
    }
  }, [newPurchaseHpp, form, isFormOpen, watchedCategory]);

  async function onSubmit(values: PurchaseFormValues) {
    try {
      let finalSellingPrice = values.sellingPrice;
      if (values.category === 'main' || values.category === 'packaging') {
          finalSellingPrice = newPurchaseHpp;
      }

      if (editingMaterial) {
        // --- RESTOCK LOGIC (Weighted Average) ---
        const newTotalQuantity = (editingMaterial.totalQuantity || 0) + values.purchaseQuantity;
        const newTotalCost = (editingMaterial.totalCost || 0) + values.purchaseCost;
        const newWeightedAverageCost = newTotalQuantity > 0 ? newTotalCost / newTotalQuantity : 0;

        const materialData = {
          ...editingMaterial,
          name: values.name,
          unit: values.unit,
          category: values.category,
          totalQuantity: newTotalQuantity,
          totalCost: newTotalCost,
          costPerUnit: newWeightedAverageCost,
          lastPurchaseQuantity: values.purchaseQuantity,
          lastPurchaseCost: values.purchaseCost,
          sellingPrice: finalSellingPrice,
        };
        const { id, ...updateData } = materialData;
        await updateRawMaterial(id, updateData);
        toast({ title: "Sukses", description: "Bahan baku diperbarui dan stok ditambahkan." });
      } else {
        // --- ADD NEW MATERIAL LOGIC ---
        const materialData = {
          ...values,
          costPerUnit: newPurchaseHpp,
          totalQuantity: values.purchaseQuantity,
          totalCost: values.purchaseCost,
          lastPurchaseQuantity: values.purchaseQuantity,
          lastPurchaseCost: values.purchaseCost,
          sellingPrice: finalSellingPrice,
        };
        await addRawMaterial(materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      }
      setFormOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }
  
  const openFormForNew = () => {
    setEditingMaterial(null);
    form.reset(defaultFormValues);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const openFormForRestock = (material: RawMaterial) => {
    setEditingMaterial(material);
    form.reset({
      name: material.name,
      unit: material.unit,
      category: material.category || 'main',
      // Pre-fill with last purchase data for convenience
      purchaseQuantity: material.lastPurchaseQuantity || 1,
      purchaseCost: material.lastPurchaseCost || material.costPerUnit,
      sellingPrice: material.sellingPrice || 0,
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const closeForm = () => {
      setFormOpen(false);
      setEditingMaterial(null);
      form.reset(defaultFormValues);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus bahan baku ini? Menghapus bahan ini dapat memengaruhi HPP pada resep yang ada, namun tidak mengubah data penjualan yang sudah tercatat.")) return;
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
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-semibold">Manajemen Bahan Baku</h1>
                <p className="text-muted-foreground">Kelola semua inventaris bahan baku Anda di sini.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">Total Nilai Stok</div>
                  <div className="text-xl font-bold">{formatCurrency(totalInventoryValue)}</div>
              </div>
              <Button onClick={openFormForNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Tambah Bahan Baku
              </Button>
            </div>
        </div>

        {isFormOpen && (
            <Card>
                <CardHeader>
                <CardTitle>{editingMaterial ? "Restock Bahan Baku" : "Tambah Bahan Baku Baru"}</CardTitle>
                <CardDescription>
                    {editingMaterial 
                        ? `Isi detail pembelian baru untuk "${editingMaterial.name}". Ini akan menambah stok yang ada dan menghitung ulang HPP.` 
                        : "Gunakan form ini untuk menambah bahan baku yang belum pernah ada di sistem."}
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nama Bahan</FormLabel><FormControl><Input {...field} placeholder="cth: Biji Kopi Arabika" /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="unit" render={({ field }) => (
                                <FormItem><FormLabel>Satuan Resep</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih satuan..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="gram">gram</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="liter">liter</SelectItem><SelectItem value="kg">kg</SelectItem><SelectItem value="pcs">pcs</SelectItem><SelectItem value="buah">buah</SelectItem><SelectItem value="botol">botol</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Kategori Bahan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Bahan Utama</SelectItem><SelectItem value="topping">Topping / Tambahan</SelectItem><SelectItem value="packaging">Kemasan / Packaging</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                        
                        <Separator />
                        <h4 className="font-semibold text-foreground">Detail Pembelian Baru</h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                            <FormField control={form.control} name="purchaseQuantity" render={({ field }) => (
                                <FormItem><FormLabel>Jumlah Pembelian</FormLabel><FormControl><Input type="number" step="any" {...field} placeholder="cth: 1000" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                <FormItem><FormLabel>Total Biaya (Rp)</FormLabel><FormControl><Input type="number" {...field} placeholder="cth: 200000" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="p-4 rounded-md bg-muted">
                                <Label className="text-xs">HPP dari Pembelian Ini</Label>
                                <p className="font-bold text-lg text-primary">{formatCurrency(newPurchaseHpp || 0)}</p>
                            </div>
                            {watchedCategory === 'topping' && (
                                <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                                    <FormItem><FormLabel>Harga Jual Topping (Rp)</FormLabel><FormControl><Input type="number" {...field} placeholder="cth: 3000" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit">{editingMaterial ? "Simpan & Restock" : "Tambah Bahan Baru"}</Button>
                            <Button variant="ghost" type="button" onClick={closeForm}>Batal</Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Daftar Inventaris Bahan Baku</CardTitle>
                <CardDescription>Klik "Restock" untuk menambah stok item yang ada, atau "Tambah Bahan Baku" untuk item baru.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead>HPP / Unit</TableHead>
                    <TableHead className="text-right w-[150px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {rawMaterials.length > 0 ? (
                    rawMaterials.map(material => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="capitalize">{material.category}</TableCell>
                        <TableCell>
                            <div className="font-semibold">{material.totalQuantity.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{material.unit}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(material.costPerUnit)} / {material.unit}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => openFormForRestock(material)}>
                                    <PackagePlus className="h-4 w-4 mr-2" />
                                    Restock
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(material.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Belum ada data bahan baku. Klik "Tambah Bahan Baku" untuk memulai.
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

