
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import type { RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2, PackagePlus, Store, LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const purchaseSchema = z.object({
  name: z.string().min(1, "Nama bahan tidak boleh kosong"),
  unit: z.string().min(1, "Satuan untuk resep tidak boleh kosong"),
  category: z.enum(['main', 'packaging', 'topping'], { required_error: "Kategori harus dipilih" }),
  purchaseQuantity: z.coerce.number().min(0.001, "Jumlah pembelian harus lebih dari 0"),
  purchaseCost: z.coerce.number().min(0, "Total biaya tidak boleh negatif"),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif").optional(),
  // Professional feature fields
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  purchaseLink: z.string().url({ message: "Link tidak valid." }).or(z.literal('')).optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const defaultFormValues: PurchaseFormValues = { 
  name: "", 
  unit: "", 
  purchaseQuantity: 1, 
  purchaseCost: 0, 
  category: 'main', 
  sellingPrice: 0,
  storeName: "",
  storeAddress: "",
  purchaseLink: "",
};

// Schema for editing details only
const detailsSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong."),
  unit: z.string().min(1, "Satuan tidak boleh kosong."),
  category: z.enum(['main', 'packaging', 'topping']),
  // Professional feature fields
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  purchaseLink: z.string().url({ message: "Link tidak valid." }).or(z.literal('')).optional(),
});
type DetailsFormValues = z.infer<typeof detailsSchema>;


export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [editingDetailsMaterial, setEditingDetailsMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
  }, [rawMaterials]);

  // Form for new/restock
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: defaultFormValues,
  });
  
  // Form for editing details
  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
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

  // Submit handler for Restock/New
  async function onSubmit(values: PurchaseFormValues) {
    try {
      let finalSellingPrice = values.sellingPrice;
      if (values.category === 'main' || values.category === 'packaging') {
          finalSellingPrice = newPurchaseHpp;
      }
      
      const { storeName, storeAddress, purchaseLink, ...restValues } = values;
      const purchaseSource = (storeName || storeAddress || purchaseLink)
        ? { storeName, storeAddress, purchaseLink }
        : undefined;

      if (editingMaterial) {
        // --- RESTOCK LOGIC (Weighted Average) ---
        const newTotalQuantity = (editingMaterial.totalQuantity || 0) + restValues.purchaseQuantity;
        const newTotalCost = (editingMaterial.totalCost || 0) + restValues.purchaseCost;
        const newWeightedAverageCost = newTotalQuantity > 0 ? newTotalCost / newTotalQuantity : 0;

        const materialData = {
          ...editingMaterial,
          name: restValues.name,
          unit: restValues.unit,
          category: restValues.category,
          totalQuantity: newTotalQuantity,
          totalCost: newTotalCost,
          costPerUnit: newWeightedAverageCost,
          lastPurchaseQuantity: restValues.purchaseQuantity,
          lastPurchaseCost: restValues.purchaseCost,
          sellingPrice: finalSellingPrice,
          purchaseSource, // Overwrite with new source info
        };
        const { id, ...updateData } = materialData;
        await updateRawMaterial(id, updateData);
        toast({ title: "Sukses", description: "Bahan baku diperbarui dan stok ditambahkan." });
      } else {
        // --- ADD NEW MATERIAL LOGIC ---
        const materialData = {
          ...restValues,
          costPerUnit: newPurchaseHpp,
          totalQuantity: restValues.purchaseQuantity,
          totalCost: restValues.purchaseCost,
          lastPurchaseQuantity: restValues.purchaseQuantity,
          lastPurchaseCost: restValues.purchaseCost,
          sellingPrice: finalSellingPrice,
          purchaseSource,
        };
        await addRawMaterial(materialData);
        toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      }
      setFormOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  // Submit handler for Editing Details
  async function onDetailsSubmit(values: DetailsFormValues) {
    if (!editingDetailsMaterial) return;
    try {
      const { storeName, storeAddress, purchaseLink, ...restValues } = values;
      const purchaseSource = (storeName || storeAddress || purchaseLink)
        ? { storeName, storeAddress, purchaseLink }
        : undefined;
      
      // Combine old financial data with new detail data
      const payload = {
          ...editingDetailsMaterial,
          ...restValues,
          purchaseSource,
      };
      const { id, ...updateData } = payload;
      await updateRawMaterial(id, updateData);
      toast({ title: "Sukses", description: "Detail bahan baku berhasil diperbarui." });
      setEditDialogOpen(false);
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
      purchaseQuantity: material.lastPurchaseQuantity || 1,
      purchaseCost: material.lastPurchaseCost || material.costPerUnit,
      sellingPrice: material.sellingPrice || 0,
      storeName: material.purchaseSource?.storeName || "",
      storeAddress: material.purchaseSource?.storeAddress || "",
      purchaseLink: material.purchaseSource?.purchaseLink || "",
    });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleEditDetails = (material: RawMaterial) => {
    setEditingDetailsMaterial(material);
    detailsForm.reset({
        name: material.name,
        unit: material.unit,
        category: material.category,
        storeName: material.purchaseSource?.storeName || '',
        storeAddress: material.purchaseSource?.storeAddress || '',
        purchaseLink: material.purchaseSource?.purchaseLink || '',
    });
    setEditDialogOpen(true);
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

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button type="button" variant="link" className="p-0 text-sm text-muted-foreground">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tambahkan Detail Sumber Pembelian (Opsional)
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 pt-4 animate-in fade-in-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={form.control} name="storeName" render={({ field }) => (
                                    <FormItem><FormLabel>Nama Toko</FormLabel><FormControl><Input {...field} placeholder="cth: Toko Bahan Kue Jaya" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="storeAddress" render={({ field }) => (
                                    <FormItem><FormLabel>Alamat Toko</FormLabel><FormControl><Input {...field} placeholder="cth: Jl. Raya No. 123" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="purchaseLink" render={({ field }) => (
                                <FormItem><FormLabel>Link Pembelian (Marketplace)</FormLabel><FormControl><Input {...field} placeholder="cth: https://tokopedia.com/..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit">{editingMaterial ? "Simpan & Restock" : "Tambah Bahan Baru"}</Button>
                            <Button variant="ghost" type="button" onClick={closeForm}>Batal</Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Detail Bahan Baku</DialogTitle>
                </DialogHeader>
                <div className="max-h-[65vh] overflow-y-auto pr-4">
                    <Form {...detailsForm}>
                        <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
                            <FormField control={detailsForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nama Bahan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={detailsForm.control} name="unit" render={({ field }) => (
                                <FormItem><FormLabel>Satuan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={detailsForm.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Kategori</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Bahan Utama</SelectItem><SelectItem value="topping">Topping / Tambahan</SelectItem><SelectItem value="packaging">Kemasan / Packaging</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <Separator/>
                            <h4 className="text-md font-medium">Sumber Pembelian (Opsional)</h4>
                             <FormField control={detailsForm.control} name="storeName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Toko</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={detailsForm.control} name="storeAddress" render={({ field }) => (
                                <FormItem><FormLabel>Alamat Toko</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={detailsForm.control} name="purchaseLink" render={({ field }) => (
                                <FormItem><FormLabel>Link Pembelian</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit">Simpan Perubahan</Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>


        <Card>
            <CardHeader>
                <CardTitle>Daftar Inventaris Bahan Baku</CardTitle>
                <CardDescription>Klik "Restock" untuk menambah stok, atau "Edit" untuk mengubah detail nama/kategori/sumber.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Stok Saat Ini</TableHead>
                    <TableHead>Total Biaya Stok</TableHead>
                    <TableHead>HPP / Unit</TableHead>
                    <TableHead className="text-right w-[220px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {rawMaterials.length > 0 ? (
                    rawMaterials.map(material => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {material.name}
                              {material.purchaseSource && (material.purchaseSource.storeName || material.purchaseSource.storeAddress || material.purchaseSource.purchaseLink) && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Store className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Sumber Pembelian</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Info lokasi/link pembelian bahan ini.
                                        </p>
                                      </div>
                                      <div className="grid gap-2 text-sm">
                                        {material.purchaseSource.storeName && (
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <span className="text-muted-foreground">Toko</span>
                                            <span className="col-span-2 font-semibold">{material.purchaseSource.storeName}</span>
                                          </div>
                                        )}
                                        {material.purchaseSource.storeAddress && (
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <span className="text-muted-foreground">Alamat</span>
                                            <span className="col-span-2">{material.purchaseSource.storeAddress}</span>
                                          </div>
                                        )}
                                        {material.purchaseSource.purchaseLink && (
                                          <div className="grid grid-cols-3 items-center gap-4">
                                            <span className="text-muted-foreground">Link</span>
                                            <a href={material.purchaseSource.purchaseLink} target="_blank" rel="noopener noreferrer" className="col-span-2 text-primary hover:underline truncate flex items-center gap-1">
                                              <LinkIcon className="h-3 w-3" /> Kunjungi Link
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs font-normal">({material.category})</span>
                        </TableCell>
                        <TableCell>
                            <div className="font-semibold">{material.totalQuantity.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{material.unit}</div>
                        </TableCell>
                         <TableCell>{formatCurrency(material.totalCost)}</TableCell>
                        <TableCell>{formatCurrency(material.costPerUnit)} / {material.unit}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex gap-2 justify-end">
                                <Button variant="secondary" size="sm" onClick={() => openFormForRestock(material)}>
                                    <PackagePlus className="h-4 w-4 mr-2" />
                                    Restock
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleEditDetails(material)}>
                                    <Edit className="h-4 w-4" />
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
