"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/context/AppContext";
import type { RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

const materialSchema = z.object({
  name: z.string().min(1, "Nama bahan tidak boleh kosong"),
  unit: z.string().min(1, "Satuan tidak boleh kosong"),
  costPerUnit: z.coerce.number().min(0, "Biaya per satuan tidak boleh negatif"),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export default function BahanBakuPage() {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: { name: "", unit: "", costPerUnit: 0 },
  });

  async function onSubmit(values: MaterialFormValues) {
    try {
      if (editingMaterial) {
        await updateRawMaterial(editingMaterial.id, values);
        toast({ title: "Sukses", description: "Bahan baku berhasil diperbarui." });
      } else {
        await addRawMaterial(values);
        toast({ title: "Sukses", description: "Bahan baku berhasil ditambahkan." });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    form.reset(material);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMaterial(null);
    form.reset({ name: "", unit: "", costPerUnit: 0 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus bahan baku ini? Menghapus bahan ini tidak akan mengubah HPP pada penjualan yang sudah tercatat.")) return;
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
                      <FormLabel>Satuan</FormLabel>
                      <FormControl><Input {...field} placeholder="cth: gram, ml, buah" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya per Satuan (Rp)</FormLabel>
                      <FormControl><Input type="number" {...field} placeholder="cth: 150" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <TableHead>Biaya per Satuan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.length > 0 ? (
                rawMaterials.map(material => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{formatCurrency(material.costPerUnit)} / {material.unit}</TableCell>
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
                  <TableCell colSpan={3} className="h-24 text-center">
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
