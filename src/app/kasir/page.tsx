
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { isSameDay, startOfToday, parseISO } from "date-fns";
import { Plus, CupSoda, Utensils, ShoppingCart, CheckCircle, Tag, Clock, Wallet, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { Drink, Food, Sale, Ingredient, RawMaterial, QueuedOrder, PackagingInfo } from "@/lib/types";
import { Separator } from "@/components/ui/separator";


// --- Helper Component: Orderan Tab ---
function OrderanTab() {
  const { orderQueue, updateQueuedOrderStatus, processQueuedOrder, rawMaterials, isLoading } = useAppContext();
  const { toast } = useToast();

  const handleProcessOrder = async (orderId: string) => {
    try {
      await processQueuedOrder(orderId);
      toast({
        title: "Sukses",
        description: `Orderan berhasil diproses dan dicatat sebagai penjualan.`,
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (orderId: string, status: 'pending' | 'ready') => {
    try {
       await updateQueuedOrderStatus(orderId, status);
       toast({
         title: "Status Diperbarui",
         description: `Status orderan telah diubah.`,
       });
    } catch(error){
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  if (orderQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShoppingCart className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Tidak Ada Orderan Masuk</h3>
        <p className="text-muted-foreground">Antrian pesanan dari halaman 'Order' akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <Accordion type="multiple" className="w-full space-y-4">
            {orderQueue.map((order) => {
                const total = order.items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

                return (
                    <AccordionItem value={order.id} key={order.id} className={cn(
                      "rounded-lg border",
                      order.status === 'ready' && "bg-green-100 dark:bg-green-900/40 border-green-400"
                    )}>
                        <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex justify-between w-full items-center">
                                <div className="flex items-center gap-4">
                                     <span className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-full text-white font-bold",
                                       order.status === 'ready' ? 'bg-green-600' : 'bg-primary'
                                     )}>
                                      {order.queueNumber}
                                    </span>
                                    <div>
                                      <div className="font-bold text-lg">Antrian #{order.queueNumber}</div>
                                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                                         <Clock className="h-3 w-3" /> {formatDate(order.createdAt, "HH:mm")}
                                      </div>
                                    </div>
                                </div>
                                <div className="text-right pr-4">
                                    <p className="font-bold">{formatCurrency(total)}</p>
                                    <p className="text-sm text-muted-foreground">{order.items.length} item</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                           <Separator className="mb-4" />
                            <div className="space-y-2">
                                {order.items.map(item => (
                                    <div key={item.cartId} className="flex justify-between">
                                        <div>
                                          <p className="font-medium">
                                            {item.quantity}x {item.name} {item.selectedPackagingName && `(${item.selectedPackagingName})`}
                                          </p>
                                          {item.selectedToppings && item.selectedToppings.length > 0 && (
                                            <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1">
                                              {item.selectedToppings.map(topping => {
                                                 const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                                                 return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>;
                                              })}
                                            </ul>
                                          )}
                                        </div>
                                        <p>{formatCurrency(item.sellingPrice * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                           <Separator className="my-4" />
                           <div className="flex justify-end gap-2">
                               {order.status === 'pending' && (
                                  <Button variant="secondary" onClick={() => handleStatusUpdate(order.id, 'ready')}>
                                      <CheckCircle className="mr-2 h-4 w-4" /> Tandai Siap
                                  </Button>
                               )}
                               <Button onClick={() => handleProcessOrder(order.id)} disabled={isLoading}>
                                    Proses & Bayar
                               </Button>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
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
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | undefined>(undefined);

  const product = productInfo?.product;
  const packagingOptions = useMemo(() => product?.packagingOptions || [], [product]);
  const productIngredients = useMemo(() => product?.ingredients.map(i => i.rawMaterialId) || [], [product]);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
      if (packagingOptions && packagingOptions.length > 0) {
        setSelectedPackagingId(packagingOptions[0].id);
      } else {
        setSelectedPackagingId(undefined);
      }
    }
  }, [isOpen, packagingOptions]);

  const availableToppings = useMemo(() => {
    if (!product || !product.availableToppings) return [];
    return product.availableToppings
      .map(toppingId => rawMaterials.find(m => m.id === toppingId))
      .filter((topping): topping is RawMaterial => 
          topping !== undefined && !productIngredients.includes(topping.id)
      );
  }, [rawMaterials, product, productIngredients]);
  
  const selectedPackaging = useMemo(() => {
    return packagingOptions.find(p => p.id === selectedPackagingId);
  }, [packagingOptions, selectedPackagingId]);

  if (!productInfo) return null;
  const { type } = productInfo;

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
  
  const packagingPrice = selectedPackaging?.additionalPrice || 0;
  const finalPrice = product.sellingPrice + packagingPrice + toppingsPrice;

  async function handleConfirmSale() {
    if (!product) return;
    if (packagingOptions.length > 0 && !selectedPackagingId) {
      toast({ title: "Pilih Ukuran", description: "Anda harus memilih ukuran kemasan.", variant: "destructive" });
      return;
    }
    const salePayload: Omit<Sale, 'id' | 'date'> = {
      productId: product.id,
      productType: type,
      quantity: 1, // Quick sell is always quantity 1
      discount: 0,
      selectedToppings: selectedToppings,
      totalSalePrice: finalPrice,
      selectedPackagingId: selectedPackaging?.id,
      selectedPackagingName: selectedPackaging?.name,
    };

    try {
      await addSale(salePayload);
      toast({
        title: "Penjualan Dicatat",
        description: `1x ${product.name} ${selectedPackaging ? `(${selectedPackaging.name})` : ''} berhasil dijual.`,
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
          <DialogTitle>Kustomisasi: {product?.name || 'Produk'}</DialogTitle>
          <DialogDescription>Pilih ukuran dan tambahan untuk penjualan cepat.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {packagingOptions.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold">Ukuran</h4>
                    <RadioGroup value={selectedPackagingId} onValueChange={setSelectedPackagingId} className="grid grid-cols-3 gap-2">
                        {packagingOptions.map((pack) => (
                            <Label key={pack.id} htmlFor={`qs-pack-${pack.id}`} className={cn(
                                "flex flex-col items-center justify-center rounded-md border-2 p-2 hover:bg-accent/80 cursor-pointer",
                                selectedPackagingId === pack.id ? "bg-accent border-primary" : "border-input"
                            )}>
                                <RadioGroupItem value={pack.id} id={`qs-pack-${pack.id}`} className="sr-only" />
                                <span className="font-bold text-sm">{pack.name}</span>
                                <span className="text-xs">+{formatCurrency(pack.additionalPrice)}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            )}
            <div className="space-y-2">
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
                        {topping.sellingPrice != null && (
                            <span className="text-sm text-muted-foreground">+{formatCurrency(topping.sellingPrice)}</span>
                        )}
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada topping tersedia.</p>
                )}
            </div>
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

// --- Helper Component: Dompet Tab ---
function DompetTab() {
  const { sales, initialCapital, setInitialCapital, cashExpenses, addCashExpense, deleteCashExpense } = useAppContext();
  const { toast } = useToast();

  const [newCapital, setNewCapital] = useState(initialCapital.toString());
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    setNewCapital(initialCapital.toString());
  }, [initialCapital]);

  const today = startOfToday();
  const todaysSales = sales.filter(s => isSameDay(parseISO(s.date), today));
  const todaysCashExpenses = cashExpenses.filter(e => isSameDay(parseISO(e.date), today));

  const totalRevenue = todaysSales.reduce((sum, s) => sum + s.totalSalePrice, 0);
  const totalExpenses = todaysCashExpenses.reduce((sum, e) => sum + e.amount, 0);
  const cashInDrawer = initialCapital + totalRevenue - totalExpenses;

  const handleSetCapital = () => {
    const amount = parseFloat(newCapital);
    if (isNaN(amount) || amount < 0) {
      toast({ title: 'Error', description: 'Modal awal tidak valid.', variant: 'destructive' });
      return;
    }
    setInitialCapital(amount);
    toast({ title: 'Sukses', description: 'Modal awal berhasil diatur.' });
  }

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || isNaN(amount) || amount <= 0) {
      toast({ title: 'Error', description: 'Deskripsi atau jumlah pengeluaran tidak valid.', variant: 'destructive' });
      return;
    }
    addCashExpense({ description: expenseDesc, amount });
    toast({ title: 'Sukses', description: 'Pengeluaran tunai berhasil dicatat.' });
    setExpenseDesc('');
    setExpenseAmount('');
  }

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Yakin ingin menghapus pengeluaran ini?")) {
      deleteCashExpense(id);
      toast({ title: 'Sukses', description: 'Pengeluaran berhasil dihapus.' });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Dompet Hari Ini</CardTitle>
          <CardDescription>Perhitungan otomatis berdasarkan penjualan dan pengeluaran tunai hari ini.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Modal Awal</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(initialCapital)}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Penjualan Tunai</CardTitle><ArrowUpCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pengeluaran Tunai</CardTitle><ArrowDownCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Uang di Laci</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(cashInDrawer)}</div></CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kelola Kas</CardTitle>
          <CardDescription>Atur modal awal untuk hari ini dan catat pengeluaran tunai.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initialCapital">Modal Awal</Label>
            <div className="flex gap-2">
              <Input id="initialCapital" type="number" value={newCapital} onChange={(e) => setNewCapital(e.target.value)} placeholder="Jumlah modal awal" />
              <Button onClick={handleSetCapital}>Atur</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium">Catat Pengeluaran Tunai</h4>
            <div className="grid sm:grid-cols-3 gap-2">
              <Input value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Deskripsi (cth: Beli es batu)" className="sm:col-span-2" />
              <Input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} type="number" placeholder="Jumlah (Rp)" />
            </div>
            <Button onClick={handleAddExpense}><Plus className="mr-2" /> Tambah Pengeluaran</Button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Riwayat Pengeluaran Hari Ini</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysCashExpenses.length > 0 ? todaysCashExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(exp.amount)}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">Belum ada pengeluaran hari ini.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// --- Main Page Component ---
export default function KasirPage() {
  const { sales, drinks, foods, addSale, rawMaterials } = useAppContext();
  const { toast } = useToast();
  const [isCustomizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [customizingProductInfo, setCustomizingProductInfo] = useState<{product: Drink | Food, type: 'drink' | 'food'} | null>(null);

  async function handleQuickSell(product: Drink | Food, type: 'drink' | 'food') {
    const hasToppings = product.availableToppings && product.availableToppings.length > 0;
    const hasPackaging = product.packagingOptions && product.packagingOptions.length > 0;

    // If there are customizations available, open dialog.
    if (hasToppings || hasPackaging) {
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
          <Tabs defaultValue="orderan" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="orderan">Antrian Orderan</TabsTrigger>
                  <TabsTrigger value="cepat">Penjualan Cepat</TabsTrigger>
                  <TabsTrigger value="dompet">Dompet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orderan">
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Orderan Masuk</CardTitle>
                        <CardDescription>Proses orderan yang masuk dari halaman 'Order' pelanggan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderanTab />
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cepat">
                <Card>
                  <CardHeader>
                    <CardTitle>Kasir Penjualan Cepat</CardTitle>
                    <CardDescription>Klik tombol pada item untuk mencatat penjualan. Jika ada kustomisasi (ukuran/topping), dialog akan muncul.</CardDescription>
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
               <TabsContent value="dompet">
                  <DompetTab />
              </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penjualan (Terbaru)</CardTitle>
              <CardDescription>Menampilkan 25 transaksi terakhir hari ini.</CardDescription>
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
                      sales.filter(s => isSameDay(parseISO(s.date), startOfToday()))
                      .slice(0, 25).map(sale => {
                        const product = sale.productType === 'drink'
                            ? drinks.find(d => d.id === sale.productId)
                            : foods.find(f => f.id === sale.productId);
                        const total = sale.totalSalePrice;
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>{formatDate(sale.date, "HH:mm")}</TableCell>
                            <TableCell className="font-medium">
                              {sale.quantity}x {product?.name || 'N/A'} {sale.selectedPackagingName && `(${sale.selectedPackagingName})`}
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
