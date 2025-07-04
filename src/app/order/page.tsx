
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CupSoda, Utensils, Plus, ShoppingCart, Trash2, Tag } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import type { Drink, Food, RawMaterial, Ingredient, CartItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// --- Decorative Blobs ---
const DecorativeBlob1 = () => (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-1/2 h-1/2 -translate-x-1/3 -translate-y-1/3 text-order-accent/30 opacity-50 z-0">
        <path fill="currentColor" d="M429,298.5Q398,347,362.5,385.5Q327,424,278.5,431Q230,438,185,419.5Q140,401,98,370.5Q56,340,55,295Q54,250,56.5,206Q59,162,99,134.5Q139,107,185,91Q231,75,276.5,76Q322,77,361,106.5Q400,136,432,173Q464,210,446.5,250Q429,290,429,298.5Z" />
    </svg>
);
const DecorativeBlob2 = () => (
     <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 w-2/3 h-2/3 translate-x-1/4 translate-y-1/4 text-order-secondary/20 opacity-50 z-0">
        <path fill="currentColor" d="M439.5,394Q363,538,241,475.5Q119,413,88,296.5Q57,180,172,130.5Q287,81,373,155.5Q459,230,439.5,394Z" />
    </svg>
);


// --- Customization Dialog Component ---
function ProductCustomizationDialog({ 
  product, 
  productType, 
  isOpen, 
  onClose 
}: { 
  product: Drink | Food | null, 
  productType: 'drink' | 'food',
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { rawMaterials, addToCart } = useAppContext();
  const { toast } = useToast();
  const [selectedToppings, setSelectedToppings] = useState<Ingredient[]>([]);
  const [quantity, setQuantity] = useState(1);

  const availableToppings = useMemo(() => {
    if (!product) return [];
    const productIngredientIds = new Set(product.ingredients.map(ing => ing.rawMaterialId));
    return rawMaterials.filter(m => m.category === 'topping' && !productIngredientIds.has(m.id));
  }, [rawMaterials, product]);
  
  const toppingsPrice = useMemo(() => {
    return selectedToppings.reduce((sum, toppingIng) => {
        const toppingData = rawMaterials.find(m => m.id === toppingIng.rawMaterialId);
        return sum + (toppingData?.sellingPrice || 0);
    }, 0);
  }, [selectedToppings, rawMaterials]);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
      setQuantity(1);
    }
  }, [isOpen]);

  if (!product) {
    return null;
  }

  const handleCheckboxChange = (checked: boolean, topping: RawMaterial) => {
    setSelectedToppings(prev => {
      if (checked) {
        return [...prev, { rawMaterialId: topping.id, quantity: 1 }];
      } else {
        return prev.filter(t => t.rawMaterialId !== topping.id);
      }
    });
  };

  const finalUnitPrice = product.sellingPrice + toppingsPrice;
  const totalPrice = finalUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, productType, quantity, selectedToppings, finalUnitPrice);
    
    toast({
      title: "Ditambahkan ke Keranjang",
      description: `${quantity}x ${product.name} telah ditambahkan.`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
        }
    }}>
      <DialogContent className="bg-order-bg border-order-primary font-body">
        <DialogHeader>
          <DialogTitle className="font-pacifico text-3xl text-order-primary">{product.name}</DialogTitle>
          <DialogDescription className="text-order-text/80">Pilih tambahan dan jumlah untuk pesanan Anda.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-order-text mb-2">Topping</h4>
              {availableToppings.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                  {availableToppings.map(topping => (
                    <div key={topping.id} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`topping-${topping.id}`}
                          onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, topping)}
                          className="border-order-primary data-[state=checked]:bg-order-primary data-[state=checked]:text-white"
                        />
                        <Label htmlFor={`topping-${topping.id}`} className="text-order-text">{topping.name}</Label>
                      </div>
                      {topping.sellingPrice != null && (
                        <span className="text-sm text-order-text/80">+{formatCurrency(topping.sellingPrice)}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-order-text/80 mt-2">Tidak ada topping tersedia.</p>
              )}
            </div>
             <div>
                <h4 className="font-bold text-order-text mb-2">Jumlah</h4>
                <div className="flex items-center justify-center gap-4 border rounded-lg p-2 bg-white/50">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-order-primary text-order-primary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                    <span className="text-2xl font-bold w-12 text-center text-order-text">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-order-primary text-order-primary" onClick={() => setQuantity(q => q + 1)}>+</Button>
                </div>
            </div>
          </div>
          <Separator className="bg-order-primary/20 !my-6" />
           <div className="flex justify-between items-center text-xl font-bold text-order-text">
                <span>Total Harga</span>
                <span>{formatCurrency(totalPrice)}</span>
           </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} className="bg-order-secondary hover:bg-order-secondary/90 text-white font-bold text-lg py-6"><Plus className="mr-2 h-4 w-4" /> Tambahkan ke Keranjang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Order Summary Sheet ---
function OrderSummarySheet({
  onConfirm
}: {
  onConfirm: () => void;
}) {
  const { cart, updateCartItemQuantity, removeFromCart, rawMaterials } = useAppContext();

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-order-secondary hover:bg-order-secondary/90 text-white z-20">
          <ShoppingCart className="h-8 w-8" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-order-primary text-xs font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-order-bg border-order-primary/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-pacifico text-3xl text-order-primary">Keranjang Anda</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.cartId} className="flex gap-4">
                <div className="flex-1">
                  <p className="font-bold text-order-text">{item.name}</p>
                   {item.selectedToppings && item.selectedToppings.length > 0 && (
                    <ul className="text-xs text-order-text/80 list-disc pl-4 mt-1">
                      {item.selectedToppings.map(topping => {
                         const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                         return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>
                      })}
                    </ul>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-order-primary text-order-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}>-</Button>
                    <span>{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-order-primary text-order-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}>+</Button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="font-semibold text-order-text">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-order-secondary" onClick={() => removeFromCart(item.cartId)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-order-text/80 h-full flex flex-col justify-center items-center">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Keranjang Anda masih kosong.</p>
                <p className="text-sm">Silakan pilih item dari menu.</p>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <SheetFooter className="border-t border-order-primary/20 pt-4 -mx-6 px-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-bold text-lg text-order-text">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <DialogClose asChild>
                <Button onClick={onConfirm} className="w-full bg-order-primary hover:bg-order-primary/90 text-white font-bold text-lg py-6">Konfirmasi Pesanan</Button>
              </DialogClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}


// --- Main Page Component ---
export default function OrderPage() {
  const { drinks, foods, appName, submitCustomerOrder, cart } = useAppContext();
  const [customizingProduct, setCustomizingProduct] = useState<Drink | Food | null>(null);
  const [productType, setProductType] = useState<'drink' | 'food'>('drink');
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newQueueNumber, setNewQueueNumber] = useState<number | null>(null);
  const { toast } = useToast();

  const handleOrderClick = (product: Drink | Food, type: 'drink' | 'food') => {
    setProductType(type);
    setCustomizingProduct(product);
  };
  
  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "Keranjang Kosong", description: "Silakan tambahkan item terlebih dahulu.", variant: "destructive" });
      return;
    }
    try {
      const queueNumber = await submitCustomerOrder();
      setNewQueueNumber(queueNumber);
      setConfirmDialogOpen(true);
    } catch(error) {
       toast({ title: "Gagal", description: (error as Error).message, variant: "destructive" });
    }
  }

  const renderProductGrid = (products: (Drink[] | Food[]), type: 'drink' | 'food') => {
     return products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(item => (
              <Card 
                key={item.id} 
                className="flex flex-col overflow-hidden group cursor-pointer rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-order-primary/10 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" 
                onClick={() => handleOrderClick(item, type)}>
                  <div className="relative">
                    <Image
                      src={item.imageUri || `https://placehold.co/600x400.png`}
                      alt={item.name}
                      width={600}
                      height={400}
                      className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={type === 'drink' ? "drink coffee" : "food pastry"}
                    />
                     <div className="absolute top-3 right-3 bg-order-secondary text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                        {formatCurrency(item.sellingPrice)}
                    </div>
                  </div>
                <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-bold truncate text-order-text">{item.name}</h3>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-order-primary hover:bg-order-primary/90 text-white font-bold rounded-lg">
                      <Plus className="mr-2 h-4 w-4" /> Pesan
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-order-primary/20 rounded-lg text-center h-48 bg-white/30">
            <p className="text-order-text font-semibold">Menu {type === 'drink' ? 'Minuman' : 'Makanan'} Akan Segera Hadir!</p>
            <p className="text-sm text-order-text/80 mt-1">Nantikan produk-produk menarik dari kami.</p>
          </div>
      );
  }

  return (
    <MainLayout>
        <div className="relative min-h-screen overflow-hidden">
          <DecorativeBlob1 />
          <DecorativeBlob2 />

          <div className="relative z-10">
            {/* Dialog for product customization */}
            <ProductCustomizationDialog 
              isOpen={customizingProduct !== null}
              onClose={() => setCustomizingProduct(null)}
              product={customizingProduct}
              productType={productType}
            />

            {/* Dialog for order confirmation */}
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent className="bg-order-bg border-order-primary font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-pacifico text-3xl text-order-primary text-center">Pesanan Diterima!</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-lg text-order-text/80 pt-4">
                           Nomor antrian Anda adalah:
                        </AlertDialogDescription>
                         <div className="flex justify-center items-center py-4">
                             <div className="flex justify-center items-center h-32 w-32 rounded-full bg-order-secondary text-white border-4 border-white shadow-lg">
                                 <span className="text-6xl font-bold">{newQueueNumber}</span>
                             </div>
                         </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full bg-order-primary hover:bg-order-primary/90 text-white font-bold">OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex flex-col items-center text-center mb-16">
                  <h1 className="font-pacifico text-5xl md:text-7xl text-order-primary tracking-tight">Selamat Datang di <span className="text-order-secondary">{appName}</span></h1>
                  <p className="text-xl text-order-text/80 mt-4 max-w-2xl">
                      Pilih menu favorit Anda di bawah ini dan nikmati sensasi rasa yang tak terlupakan.
                  </p>
              </div>

              <div className="space-y-20">
                  {/* Minuman Section */}
                  <div>
                      <div className="flex items-center gap-4 mb-8">
                          <div className="bg-order-accent/80 p-3 rounded-full shadow-sm">
                              <CupSoda className="h-8 w-8 text-order-primary"/>
                          </div>
                          <h2 className="font-pacifico text-5xl text-order-primary">Minuman</h2>
                          <div className="flex-grow h-1 bg-gradient-to-r from-order-accent/50 to-transparent rounded-full" />
                      </div>
                      {renderProductGrid(drinks, 'drink')}
                  </div>

                  {/* Makanan Section */}
                  <div>
                      <div className="flex items-center gap-4 mb-8">
                           <div className="bg-order-accent/80 p-3 rounded-full shadow-sm">
                              <Utensils className="h-8 w-8 text-order-primary"/>
                          </div>
                          <h2 className="font-pacifico text-5xl text-order-primary">Makanan</h2>
                          <div className="flex-grow h-1 bg-gradient-to-r from-order-accent/50 to-transparent rounded-full" />
                      </div>
                      {renderProductGrid(foods, 'food')}
                  </div>
              </div>
            </div>
          </div>
          <OrderSummarySheet onConfirm={handleConfirmOrder} />
        </div>
    </MainLayout>
  );
}
