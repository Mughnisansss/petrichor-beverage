"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, PlusCircle, CupSoda, Utensils } from "lucide-react";
import type { Drink, Food } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const manualSaleSchema = z.object({
  productId: z.string().min(1, "Pilih produk yang dijual."),
  quantity: z.coerce.number().min(1, "Jumlah minimal 1."),
  discount: z.coerce.number().min(0, "Diskon tidak boleh negatif.").max(100, "Diskon maksimal 100.").default(0),
});
type ManualSaleFormValues = z.infer<typeof manualSaleSchema>;

// --- Helper Component: Manual Sale Form ---
function ManualSaleForm() {
  const { drinks, foods, addSale } = useAppContext();
  const { toast } = useToast();

  const form = useForm<ManualSaleFormValues>({
    resolver: zodResolver(manualSaleSchema),
    defaultValues: { productId: "", quantity: 1, discount: 0 },
  });

  async function onSubmit(values: ManualSaleFormValues) {
    const [productType, productId] = values.productId.split(':');
    const product = productType === 'drink'
      ? drinks.find(d => d.id === productId)
      : foods.find(f => f.id === productId);

    if (!product) {
      toast({ title: "Error", description: "Produk tidak ditemukan.", variant: "destructive" });
      return;
    }

    try {
      await addSale({
        productId,
        productType: productType as 'drink' | 'food',
        quantity: values.quantity,
        discount: values.discount,
      });
      toast({
        title: "Penjualan Dicatat",
        description: `${values.quantity}x ${product.name} berhasil dijual.`,
      });
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produk</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih minuman atau makanan..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {drinks.length > 0 && (
                    <SelectGroup>
                      <FormLabel className="px-2 py-1.5 text-sm font-semibold">Minuman</FormLabel>
                      {drinks.map(drink => (
                        <SelectItem key={drink.id} value={`drink:${drink.id}`}>{drink.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {foods.length > 0 && (
                     <SelectGroup>
                      <FormLabel className="px-2 py-1.5 text-sm font-semibold">Makanan</FormLabel>
                      {foods.map(food => (
                        <SelectItem key={food.id} value={`food:${food.id}`}>{food.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diskon (%)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" /> Catat Penjualan</Button>
      </form>
    </Form>
  );
}


// --- Main Page Component ---
export default function KasirPage() {
  const { sales, drinks, foods, addSale } = useAppContext();
  const { toast } = useToast();

  async function handleQuickSell(product: Drink | Food, type: 'drink' | 'food') {
    try {
      await addSale({
        productId: product.id,
        productType: type,
        quantity: 1,
        discount: 0,
      });
      toast({
        title: "Penjualan Dicatat",
        description: `1x ${product.name} berhasil dijual.`,
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  const renderProductGrid = (products: (Drink[] | Food[]), type: 'drink' | 'food') => {
    if (products.length === 0) {
      return (
         <div className="text-center text-muted-foreground p-4 col-span-full">
            Belum ada data {type === 'drink' ? 'minuman' : 'makanan'}. Silakan tambahkan di halaman 'Produk'.
        </div>
      )
    }
    return products.map(product => (
        <Card key={product.id} className="flex flex-col">
            <CardHeader className="p-4 flex-grow">
            <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm font-semibold">{formatCurrency(product.sellingPrice)}</p>
            </CardContent>
            <CardFooter className="p-2">
            <Button className="w-full" onClick={() => handleQuickSell(product, type)} size="sm">
                <Plus className="mr-2 h-4 w-4"/> Jual
            </Button>
            </CardFooter>
        </Card>
    ));
  }

  return (
    <MainLayout>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="cepat" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="cepat">Penjualan Cepat</TabsTrigger>
                  <TabsTrigger value="manual">Input Manual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cepat">
                <Card>
                  <CardHeader>
                    <CardTitle>Kasir Penjualan Cepat</CardTitle>
                    <CardDescription>Klik tombol pada item untuk mencatat penjualan (kuantitas 1, diskon 0%).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CupSoda className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Minuman</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {renderProductGrid(drinks, 'drink')}
                        </div>
                     </div>
                     <Separator />
                     <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Utensils className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Makanan</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {renderProductGrid(foods, 'food')}
                        </div>
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Penjualan Manual</CardTitle>
                        <CardDescription>Gunakan formulir ini untuk mencatat penjualan dengan kuantitas dan diskon spesifik.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManualSaleForm />
                    </CardContent>
                </Card>
              </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Riwayat Penjualan (Terbaru)</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.length > 0 ? (
                      sales.map(sale => {
                        const product = sale.productType === 'drink'
                            ? drinks.find(d => d.id === sale.productId)
                            : foods.find(f => f.id === sale.productId);
                        const total = product ? product.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0;
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                            <TableCell className="font-medium">{product?.name || 'N/A'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          Belum ada riwayat penjualan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
