
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import type { RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2, Store, LinkIcon, AlertTriangle, Copy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const materialSchema = z.object({
  name: z.string().min(1, "Nama bahan tidak boleh kosong"),
  recipeUnit: z.string().min(1, "Satuan untuk resep tidak boleh kosong"),
  category: z.enum(['main', 'packaging', 'topping'], { required_error: "Kategori harus dipilih" }),
  
  purchaseCost: z.coerce.number().min(0, "Total biaya tidak boleh negatif"),
  totalUnits: z.coerce.number().min(0.001, "Jumlah satuan harus lebih dari 0"),

  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif").optional(),
  
  // Professional feature fields
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  purchaseLink: z.string().url({ message: "Link tidak valid." }).or(z.literal('')).optional(),
  lowStockThreshold: z.coerce.number().min(0, "Batas stok tidak boleh negatif").optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

const defaultFormValues: MaterialFormValues = { 
  name: "", 
  recipeUnit: "", 
  category: 'main', 
  purchaseCost: 0,
  totalUnits: 1,
  sellingPrice: 0,
  storeName: "",
  storeAddress: "",
  purchaseLink: "",
  lowStockThreshold: 0,
};

// Schema for editing details only
const detailsSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong."),
  recipeUnit: z.string().min(1, "Satuan tidak boleh kosong."),
  category: z.enum(['main', 'packaging', 'topping']),
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  purchaseLink: z.string().url({ message: "Link tidak valid." }).or(z.literal('')).optional(),
  lowStockThreshold: z.coerce.number().min(0, "Batas stok tidak boleh negatif").optional(),
});
type DetailsFormValues = z.infer<typeof detailsSchema>;


export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDetailsMaterial, setEditingDetailsMaterial] = useState<RawMaterial | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, material) => sum + (material.totalCost || 0), 0);
  }, [rawMaterials]);

  const filteredMaterials = useMemo(() => {
    if (categoryFilter === 'all') {
      return rawMaterials;
    }
    return rawMaterials.filter(m => m.category === categoryFilter);
  }, [rawMaterials, categoryFilter]);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: defaultFormValues,
  });
  
  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
  });
  
  const watchedFormValues = form.watch();

  const costPerUnit = useMemo(() => {
    const { purchaseCost, totalUnits } = watchedFormValues;
    if (totalUnits > 0) {
      return purchaseCost / totalUnits;
    }
    return 0;
  }, [watchedFormValues]);
  
  useEffect(() => {
    if (isFormOpen && (watchedFormValues.category === 'packaging' || watchedFormValues.category === 'main')) {
      form.setValue('sellingPrice', costPerUnit, { shouldValidate: true });
    }
  }, [costPerUnit, form, isFormOpen, watchedFormValues.category]);

  async function onSubmit(values: MaterialFormValues) {
    try {
      let finalSellingPrice = values.sellingPrice;
      if (values.category === 'main' || values.category === 'packaging') {
          finalSellingPrice = costPerUnit;
      }
      
      const purchaseSource = (values.storeName || values.storeAddress || values.purchaseLink)
        ? { storeName: values.storeName, storeAddress: values.storeAddress, purchaseLink: values.purchaseLink }
        : undefined;

      const newMaterialPayload: Omit<RawMaterial, 'id'> = {
        name: values.name,
        unit: values.recipeUnit,
        category: values.category,
        totalQuantity: values.totalUnits,
        totalCost: values.purchaseCost,
        costPerUnit: costPerUnit,
        lastPurchaseQuantity: values.totalUnits,
        lastPurchaseCost: values.purchaseCost,
        sellingPrice: finalSellingPrice,
        purchaseSource,
        lowStockThreshold: values.lowStockThreshold,
      };
      await addRawMaterial(newMaterialPayload);
      toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      
      setFormOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  async function onDetailsSubmit(values: DetailsFormValues) {
    if (!editingDetailsMaterial) return;
    try {
      const { storeName, storeAddress, purchaseLink, ...restValues } = values;
      const purchaseSource = (storeName || storeAddress || purchaseLink)
        ? { storeName, storeAddress, purchaseLink }
        : undefined;
      
      const payload = {
          ...editingDetailsMaterial,
          ...restValues,
          unit: values.recipeUnit, // map recipeUnit to unit
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
  
  const openFormForNew = (materialToCopy?: RawMaterial) => {
    if (materialToCopy) {
      form.reset({
        name: `Salinan dari ${materialToCopy.name}`,
        recipeUnit: materialToCopy.unit,
        category: materialToCopy.category,
        purchaseCost: materialToCopy.lastPurchaseCost || 0,
        totalUnits: materialToCopy.lastPurchaseQuantity || 1,
        sellingPrice: materialToCopy.sellingPrice,
        storeName: materialToCopy.purchaseSource?.storeName || "",
        storeAddress: materialToCopy.purchaseSource?.storeAddress || "",
        purchaseLink: materialToCopy.purchaseSource?.purchaseLink || "",
        lowStockThreshold: materialToCopy.lowStockThreshold,
      });
    } else {
      form.reset(defaultFormValues);
    }
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleEditDetails = (material: RawMaterial) => {
    setEditingDetailsMaterial(material);
    detailsForm.reset({
        name: material.name,
        recipeUnit: material.unit, // map unit to recipeUnit
        category: material.category,
        storeName: material.purchaseSource?.storeName || '',
        storeAddress: material.purchaseSource?.storeAddress || '',
        purchaseLink: material.purchaseSource?.purchaseLink || '',
        lowStockThreshold: material.lowStockThreshold || 0,
    });
    setEditDialogOpen(true);
  };
  
  const closeForm = () => {
      setFormOpen(false);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Manajemen Bahan Baku</h1>
                <p className="text-muted-foreground">Kelola semua inventaris bahan baku Anda di sini.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-right flex-grow sm:flex-grow-0">
                  <div className="text-sm font-medium text-muted-foreground">Total Nilai Stok</div>
                  <div className="text-xl font-bold">{formatCurrency(totalInventoryValue)}</div>
              </div>
              <Button onClick={() => openFormForNew()} className="shrink-0">
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Tambah
              </Button>
            </div>
        </div>

        {isFormOpen && (
            <Card>
                <CardHeader>
                <CardTitle>Tambah Bahan Baku Baru</CardTitle>
                <CardDescription>
                    Isi informasi berdasarkan satu kali pembelian untuk menghitung stok dan HPP secara otomatis.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        <div className="p-4 border rounded-lg space-y-4">
                          <h4 className="font-semibold text-foreground">Informasi Dasar</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem><FormLabel>Nama Bahan</FormLabel><FormControl><Input {...field} placeholder="cth: Tepung Terigu" /></FormControl><FormMessage /></FormItem>
                              )}/>
                               <FormField control={form.control} name="recipeUnit" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Satuan Resep</FormLabel>
                                    <FormControl><Input {...field} placeholder="cth: gram, ml, sendok" /></FormControl>
                                    <FormDescription>Satuan yang akan Anda pakai di resep.</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}/>
                               <FormField control={form.control} name="category" render={({ field }) => (
                                  <FormItem><FormLabel>Kategori Bahan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Bahan Utama</SelectItem><SelectItem value="topping">Topping / Tambahan</SelectItem><SelectItem value="packaging">Kemasan / Packaging</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                              )}/>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg space-y-4">
                           <h4 className="font-semibold text-foreground">Informasi Pembelian & Stok Awal</h4>
                           <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                               <FormField control={form.control} name="purchaseCost" render={({ field }) => (
                                    <FormItem className="flex-1"><FormLabel>Total Biaya Pembelian (Rp)</FormLabel><FormControl><Input type="number" {...field} placeholder="cth: 10000" /></FormControl><FormDescription>Misal: Harga 1 bungkus tepung.</FormDescription><FormMessage /></FormItem>
                                )}/>
                                
                                <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground" />

                                <FormField control={form.control} name="totalUnits" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Total Satuan Dihasilkan</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormDescription>Dari pembelian di atas, dapat berapa <span className="font-bold">{watchedFormValues.recipeUnit || 'satuan'}</span>?</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                           </div>
                        </div>
                        
                        <div className="p-4 rounded-md bg-muted flex-grow">
                            <Label className="text-sm">HPP / {watchedFormValues.recipeUnit || 'Satuan'}</Label>
                            <p className="font-bold text-2xl text-primary">{formatCurrency(costPerUnit || 0)}</p>
                            <p className="text-xs text-muted-foreground">Harga pokok per satuan resep dihitung secara otomatis.</p>
                        </div>

                         {watchedFormValues.category === 'topping' && (
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold text-foreground mb-4">Harga Jual (Untuk Topping)</h4>
                                <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                                    <FormItem className="max-w-xs">
                                        <FormLabel>Harga Jual per {watchedFormValues.recipeUnit || 'Satuan'}</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="cth: 3000" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        )}

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button type="button" variant="link" className="p-0 text-sm text-muted-foreground">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tambahkan Detail Lanjutan (Opsional)
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
                             <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Batas Stok Minimum (dalam <span className="font-bold">{watchedFormValues.recipeUnit || 'satuan resep'}</span>)</FormLabel>
                                  <FormControl><Input type="number" {...field} placeholder="cth: 100" /></FormControl>
                                  <FormDescription>Aplikasi akan memberi tanda jika stok di bawah batas ini.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}/>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit">Tambah Bahan Baru</Button>
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
                            <FormField control={detailsForm.control} name="recipeUnit" render={({ field }) => (
                                <FormItem><FormLabel>Satuan Resep</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={detailsForm.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Kategori</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="main">Bahan Utama</SelectItem><SelectItem value="topping">Topping / Tambahan</SelectItem><SelectItem value="packaging">Kemasan / Packaging</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={detailsForm.control} name="lowStockThreshold" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Batas Stok Minimum</FormLabel>
                                  <FormControl><Input type="number" {...field} placeholder="cth: 100" /></FormControl>
                                  <FormDescription>Aplikasi akan memberi tanda jika stok di bawah batas ini.</FormDescription>
                                  <FormMessage />
                                </FormItem>
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
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Daftar Inventaris Bahan Baku</CardTitle>
                        <CardDescription>Klik "Edit" untuk mengubah detail nama/kategori/sumber.</CardDescription>
                    </div>
                    <div className="w-full max-w-[200px]">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter kategori..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                <SelectItem value="main">Bahan Utama</SelectItem>
                                <SelectItem value="topping">Topping / Tambahan</SelectItem>
                                <SelectItem value="packaging">Kemasan / Packaging</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
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
                {filteredMaterials.length > 0 ? (
                    filteredMaterials.map(material => (
                    <TableRow key={material.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {material.lowStockThreshold != null && material.totalQuantity <= material.lowStockThreshold && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Stok menipis! Sisa: {material.totalQuantity}{material.unit}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
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
                                <Button variant="outline" size="icon" onClick={() => openFormForNew(material)}>
                                    <Copy className="h-4 w-4" />
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
                        Belum ada data bahan baku untuk kategori ini.
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



