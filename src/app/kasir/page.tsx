
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, PlusCircle, CupSoda, Utensils, ShoppingCart, Trash2, CheckCircle } from "lucide-react";
import type { Drink, Food, Sale, Ingredient, RawMaterial } from "@/lib/types";
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

  const allReady = useMemo(() => {
    if (cart.length === 0) return false;
    return cart.every(item => completedOrders.has(item.cartId));
  }, [cart, completedOrders]);

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
      <Button 
        className="w-full transition-all" 
        size="lg" 
        onClick={handleProcessOrder} 
        disabled={isLoading || cart.length === 0}
        variant={allReady ? "default" : "secondary"}
      >
        {allReady ? <><CheckCircle className="mr-2 h-5 w-5"/> Konfirmasi & Catat Penjualan</> : "Proses & Catat Semua Penjualan"}
      </Button>
    </div>
  );
}

// --- Helper Component: Quick Sell Customization Dialog ---
function QuickSellDialog({
  isOpen,
  onOpenChange,
  productInfo,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productInfo: { product: Drink | Food; type: 'drink' | 'food' } | null;
}) {
  const { addSale, rawMaterials } = useAppContext();
  const { toast } = useToast();
  const [selectedToppings, setSelectedToppings] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
    }
  }, [isOpen]);

  const availableToppings = useMemo(() => rawMaterials.filter(m => m.category === 'topping'), [rawMaterials]);
  
  if (!productInfo) return null;
  const { product, type } = productInfo;

  const handleCheckboxChange = (checked: boolean, topping: RawMaterial) => {
    setSelectedToppings(prev => {
      if (checked) {
        return [...prev, { rawMaterialId: topping.id, quantity: 1 }];
      } else {
        return prev.filter(t => t.rawMaterialId !== topping.id);
      }
    });
  };
  
  const toppingsPrice = selectedToppings.reduce((sum, toppingIng) => {
      const toppingData = rawMaterials.find(m => m.id === toppingIng.rawMaterialId);
      return sum + (toppingData?.sellingPrice || 0);
  }, 0);

  const finalPrice = product.sellingPrice + toppingsPrice;

  async function handleConfirmSale() {
    const salePayload: Omit<Sale, 'id' | 'date'> = {
      productId: product.id,
      productType: type,
      quantity: 1, // Quick sell is always quantity 1
      discount: 0,
      selectedToppings: selectedToppings,
      totalSalePrice: finalPrice, // Since quantity is 1
    };

    try {
      await addSale(salePayload);
      toast({
        title: "Penjualan Dicatat",
        description: `1x ${product.name} berhasil dijual.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kustomisasi: {product.name}</DialogTitle>
          <DialogDescription>Pilih tambahan untuk penjualan cepat.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h4 className="font-semibold">Topping</h4>
          {availableToppings.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableToppings.map(topping => (
                <div key={topping.id} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`qs-topping-${topping.id}`}
                      onCheckedChange={checked => handleCheckboxChange(checked as boolean, topping)}
                    />
                    <Label htmlFor={`qs-topping-${topping.id}`}>{topping.name}</Label>
                  </div>
                  {topping.sellingPrice && (
                    <span className="text-sm text-muted-foreground">+{formatCurrency(topping.sellingPrice)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada topping tersedia.</p>
          )}
        </div>
        <Separator/>
        <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Harga</span>
            <span>{formatCurrency(finalPrice)}</span>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirmSale} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Konfirmasi & Jual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Main Page Component ---
export default function KasirPage() {
  const { sales, drinks, foods, addSale, rawMaterials } = useAppContext();
  const { toast } = useToast();
  const [isCustomizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [customizingProductInfo, setCustomizingProductInfo] = useState<{product: Drink | Food, type: 'drink' | 'food'} | null>(null);

  async function handleQuickSell(product: Drink | Food, type: 'drink' | 'food') {
    const availableToppings = rawMaterials.filter(m => m.category === 'topping');

    // If there are toppings available, open customization dialog.
    if (availableToppings.length > 0) {
        setCustomizingProductInfo({ product, type });
        setCustomizeDialogOpen(true);
        return;
    }
    
    // Otherwise, perform a direct sale.
    try {
      const salePayload: Omit<Sale, 'id' | 'date'> = {
        productId: product.id,
        productType: type,
        quantity: 1,
        discount: 0,
        selectedToppings: [],
        totalSalePrice: product.sellingPrice
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
        <Card key={product.id} className="flex flex-col overflow-hidden">
            <div className="relative">
              <Image
                  src={product.imageUri || 'https://placehold.co/300x200.png'}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="object-cover w-full h-24"
                  data-ai-hint={type === 'drink' ? "drink beverage" : "food meal"}
              />
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <CardTitle className="text-sm font-semibold leading-tight flex-grow mb-1">{product.name}</CardTitle>
              <p className="text-xs">{formatCurrency(product.sellingPrice)}</p>
            </div>
            <CardFooter className="p-2 pt-0 mt-auto">
              <Button className="w-full" size="sm" onClick={() => handleQuickSell(product, type)}>
                  <Plus className="mr-2 h-4 w-4" /> Jual
              </Button>
            </CardFooter>
        </Card>
    ));
  }

  return (
    <MainLayout>
      <QuickSellDialog
        isOpen={isCustomizeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCustomizingProductInfo(null);
          }
          setCustomizeDialogOpen(open);
        }}
        productInfo={customizingProductInfo}
      />
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
                    <CardDescription>Klik tombol pada item untuk mencatat penjualan. Jika ada topping, dialog kustomisasi akan muncul.</CardDescription>
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
            <CardHeader>
              <CardTitle>Riwayat Penjualan (Terbaru)</CardTitle>
              <CardDescription>Menampilkan 25 transaksi terakhir.</CardDescription>
            </CardHeader>
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
                      sales.slice(0, 25).map(sale => {
                        const product = sale.productType === 'drink'
                            ? drinks.find(d => d.id === sale.productId)
                            : foods.find(f => f.id === sale.productId);
                        // Use the stored totalSalePrice for accuracy. Fallback for old data.
                        const total = sale.totalSalePrice ?? (product ? product.sellingPrice * sale.quantity * (1 - sale.discount / 100) : 0);
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                            <TableCell className="font-medium">
                              {sale.quantity}x {product?.name || 'N/A'}
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
