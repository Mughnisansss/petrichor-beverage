
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
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

const defaultFormValues: MaterialFormValues = { 
  name: "", 
  unit: "", 
  totalQuantity: 1, 
  totalCost: 0, 
  category: 'main', 
  sellingPrice: 0 
};


// --- Main Page Component ---
export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [restockMultipliers, setRestockMultipliers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
  }, [rawMaterials]);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: defaultFormValues,
  });
  
  const watchedTotalQuantity = form.watch("totalQuantity");
  const watchedTotalCost = form.watch("totalCost");
  const watchedCategory = form.watch("category");

  const costPerUnit = (watchedTotalCost && watchedTotalQuantity > 0) ? watchedTotalCost / watchedTotalQuantity : 0;
  
  useEffect(() => {
    if (isFormVisible && (watchedCategory === 'packaging' || watchedCategory === 'main')) {
      form.setValue('sellingPrice', costPerUnit, { shouldValidate: true });
    }
  }, [costPerUnit, form, isFormVisible, watchedCategory]);

  async function onSubmit(values: MaterialFormValues) {
    try {
      const purchaseQuantity = values.totalQuantity;
      const purchaseCost = values.totalCost;
      
      let finalSellingPrice = values.sellingPrice;
      if (values.category === 'main' || values.category === 'packaging') {
          finalSellingPrice = purchaseCost / purchaseQuantity;
      }

      if (editingMaterial) {
        // When editing, we ADD the new purchase to the existing stock and update HPP.
        const newTotalQuantity = (editingMaterial.totalQuantity || 0) + purchaseQuantity;
        const newTotalCost = (editingMaterial.totalCost || 0) + purchaseCost;
        const newWeightedAverageCost = newTotalQuantity > 0 ? newTotalCost / newTotalQuantity : 0;

        const materialData = {
          ...editingMaterial,
          ...values, // Update name, unit, category
          totalQuantity: newTotalQuantity,
          totalCost: newTotalCost,
          costPerUnit: newWeightedAverageCost,
          lastPurchaseQuantity: purchaseQuantity,
          lastPurchaseCost: purchaseCost,
          sellingPrice: finalSellingPrice,
        };
        const { id, ...updateData } = materialData;
        await updateRawMaterial(id, updateData);
        toast({ title: "Sukses", description: "Bahan baku diperbarui dan stok ditambahkan." });
      } else {
        // When adding, the first purchase defines everything.
        const materialData = {
          ...values,
          costPerUnit: purchaseCost / purchaseQuantity,
          totalQuantity: purchaseQuantity,
          totalCost: purchaseCost,
          lastPurchaseQuantity: purchaseQuantity,
          lastPurchaseCost: purchaseCost,
          sellingPrice: finalSellingPrice,
        };
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
      totalQuantity: material.lastPurchaseQuantity || 1, // Use last purchase as default
      totalCost: material.lastPurchaseCost || material.costPerUnit,
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

  const handleRestock = async (material: RawMaterial) => {
    const multiplierStr = restockMultipliers[material.id] || "1";
    const multiplier = parseInt(multiplierStr, 10);

    if (isNaN(multiplier) || multiplier <= 0) {
        toast({ title: "Error", description: "Pengali tidak valid.", variant: "destructive" });
        return;
    }

    const baseQuantity = material.lastPurchaseQuantity;
    const baseCost = material.lastPurchaseCost;

    if (baseQuantity === undefined || baseCost === undefined) {
        toast({ title: "Data Pembelian Terakhir Tidak Ada", description: `Silakan "Edit" bahan baku ini terlebih dahulu untuk mendefinisikan unit pembelian terakhir.`, variant: "destructive" });
        return;
    }
     try {
        const quantityToAdd = baseQuantity * multiplier;
        const costToAdd = baseCost * multiplier;

        const newTotalQuantity = material.totalQuantity + quantityToAdd;
        const newTotalCost = material.totalCost + costToAdd;
        const newCostPerUnit = newTotalCost / newTotalQuantity;

        const payload = {
            ...material,
            totalQuantity: newTotalQuantity,
            totalCost: newTotalCost,
            costPerUnit: newCostPerUnit,
        };
        const { id, ...updateData } = payload;
        
        await updateRawMaterial(id, updateData);

        toast({ title: "Sukses", description: `Stok ${material.name} berhasil di-restock (x${multiplier}).` });
        setRestockMultipliers(prev => ({ ...prev, [id]: "1" })); // Reset multiplier
    } catch (error) {
        toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }
  
  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Manajemen Bahan Baku</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">Total Nilai Stok</div>
                  <div className="text-xl font-bold">{formatCurrency(totalInventoryValue)}</div>
              </div>
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
        </div>

        {isFormVisible && (
            <Card>
                <CardHeader>
                <CardTitle>{editingMaterial ? "Edit & Tambah Stok" : "Tambah Bahan Baku Baru"}</CardTitle>
                <CardDescription>
                    {editingMaterial ? "Isi detail pembelian baru untuk menambah stok dan memperbarui HPP." : "Gunakan form ini untuk menambah bahan baku baru."}
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
                                <FormLabel>Jumlah Pembelian</FormLabel>
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
                                <FormDescription>Total harga pembelian unit ini.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-md bg-muted">
                                <Label>Harga Pokok per Satuan (HPP)</Label>
                                <p className="font-bold text-2xl text-primary">{formatCurrency(costPerUnit || 0)}</p>
                                <FormDescription>Dihitung dari Total Biaya / Jumlah Beli.</FormDescription>
                            </div>
                            {watchedCategory === 'topping' && (
                                <FormField
                                    control={form.control}
                                    name="sellingPrice"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga Jual Topping (Rp)</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="cth: 3000" /></FormControl>
                                        <FormDescription>Harga yang akan ditagihkan ke pelanggan.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit">{editingMaterial ? "Simpan & Tambah Stok" : "Tambah Bahan Baru"}</Button>
                            {editingMaterial && (
                            <Button variant="ghost" type="button" onClick={handleCancel}>Batal</Button>
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
             <CardDescription>Gunakan kontrol 'x1' di paling kanan untuk restock cepat berdasarkan unit pembelian terakhir, lalu tekan Enter.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead>Total Biaya Stok</TableHead>
                    <TableHead>Harga Pokok (HPP)</TableHead>
                    <TableHead className="text-right w-[220px]">Aksi & Restock Cepat</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {rawMaterials.length > 0 ? (
                    rawMaterials.map(material => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.totalQuantity.toLocaleString()} {material.unit}</TableCell>
                        <TableCell>{formatCurrency(material.totalCost)}</TableCell>
                        <TableCell>{formatCurrency(material.costPerUnit)} / {material.unit}</TableCell>
                        <TableCell>
                            <div className="flex gap-2 justify-end items-center">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(material)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(material.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1 border rounded-md pl-2 bg-background">
                                    <span className="text-sm text-muted-foreground">x</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        className="w-16 h-9 border-0 shadow-none focus-visible:ring-0 px-1"
                                        value={restockMultipliers[material.id] || '1'}
                                        onChange={(e) => setRestockMultipliers(prev => ({...prev, [material.id]: e.target.value}))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleRestock(material);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
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
