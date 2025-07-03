
"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, PlusCircle, CupSoda, Utensils, ShoppingCart, Trash2, CheckCircle } from "lucide-react";
import type { Drink, Food, Sale } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

// --- Helper Component: Orderan Tab ---
function OrderanTab() {
  const { cart, updateCartItemQuantity, removeFromCart, batchAddSales, clearCart, isLoading, rawMaterials } = useAppContext();
  const { toast } = useToast();
  const [completedOrders, setCompletedOrders] = useState<Set<string>>(new Set());

  const total = useMemo(() => {
    // sellingPrice in cart item already includes toppings
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const handleProcessOrder = async () => {
    if (cart.length === 0) return;
    try {
      const salesPayload = cart.map(item => {
        // The final price for the sale record, assuming 0 discount from this flow
        const totalSalePrice = item.sellingPrice * item.quantity;
        return {
          productId: item.productId,
          productType: item.productType,
          quantity: item.quantity,
          discount: 0,
          selectedToppings: item.selectedToppings,
          totalSalePrice: totalSalePrice,
        };
      });
      await batchAddSales(salesPayload);
      clearCart();
      setCompletedOrders(new Set());
      toast({
        title: "Sukses",
        description: `${cart.length} orderan berhasil diproses dan dicatat sebagai penjualan.`,
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const handleOrderReady = (cartId: string) => {
    setCompletedOrders(prev => new Set(prev).add(cartId));
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShoppingCart className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Tidak Ada Orderan</h3>
        <p className="text-muted-foreground">Pelanggan dapat membuat orderan dari halaman 'Order'.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[45vh] overflow-y-auto pr-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="w-[120px] text-center">Jumlah</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="w-[200px] text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map(item => (
              <TableRow key={item.cartId}>
                <TableCell className="font-medium">
                  {item.name}
                  {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                      {item.selectedToppings.map(topping => {
                         const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                         return (
                           <li key={topping.rawMaterialId}>
                            {toppingInfo?.name || '...'}
                           </li>
                         );
                      })}
                    </ul>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}>+</Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(item.sellingPrice * item.quantity)}</TableCell>
                <TableCell className="text-center space-x-2">
                  {completedOrders.has(item.cartId) ? (
                     <Button variant="secondary" size="sm" className="w-full" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" /> Selesai
                     </Button>
                  ) : (
                     <Button variant="outline" size="sm" className="w-full" onClick={() => handleOrderReady(item.cartId)}>
                        Selesai Dibuat
                     </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.cartId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Separator />
      <div className="flex justify-between items-center font-bold text-lg">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button className="w-full" size="lg" onClick={handleProcessOrder} disabled={isLoading || cart.length === 0}>
        Proses & Catat Semua Penjualan
      </Button>
    </div>
  );
}


// --- Main Page Component ---
export default function KasirPage() {
  const { sales, drinks, foods, addSale, rawMaterials } = useAppContext();
  const { toast } = useToast();

  async function handleQuickSell(product: Drink | Food, type: 'drink' | 'food') {
    try {
      const salePayload: Omit<Sale, 'id' | 'date'> = {
        productId: product.id,
        productType: type,
        quantity: 1,
        discount: 0,
        selectedToppings: [],
        totalSalePrice: product.sellingPrice // For a quick sale, total price is just the product's base price
      };
      await addSale(salePayload);
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
                  <TabsTrigger value="orderan">Orderan</TabsTrigger>
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

              <TabsContent value="orderan">
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Orderan</CardTitle>
                        <CardDescription>Proses orderan yang masuk dari halaman 'Order' pelanggan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderanTab />
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
                        // Use the stored totalSalePrice for accuracy. Fallback for old data.
                        const total = sale.totalSalePrice ?? (product ? product.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0);
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                            <TableCell className="font-medium">
                              {product?.name || 'N/A'}
                               {sale.selectedToppings && sale.selectedToppings.length > 0 && (
                                <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                  {sale.selectedToppings.map(topping => {
                                      const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                                      return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>
                                  })}
                                </ul>
                              )}
                            </TableCell>
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
