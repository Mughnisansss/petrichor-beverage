
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { CupSoda, Utensils, Plus, ShoppingCart, Trash2, Flame, Snowflake } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import type { Drink, Food, RawMaterial, Ingredient, CartItem, PackagingInfo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// --- Decorative Blobs ---
const DecorativeBlob1 = () => (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-1/2 h-1/2 -translate-x-1/3 -translate-y-1/3 text-accent/30 opacity-50 z-0 pointer-events-none">
        <path fill="currentColor" d="M429,298.5Q398,347,362.5,385.5Q327,424,278.5,431Q230,438,185,419.5Q140,401,98,370.5Q56,340,55,295Q54,250,56.5,206Q59,162,99,134.5Q139,107,185,91Q231,75,276.5,76Q322,77,361,106.5Q400,136,432,173Q464,210,446.5,250Q429,290,429,298.5Z" />
    </svg>
);
const DecorativeBlob2 = () => (
     <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 w-2/3 h-2/3 translate-x-1/4 translate-y-1/4 text-secondary/20 opacity-50 z-0 pointer-events-none">
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
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  
  const productIngredients = useMemo(() => product?.ingredients.map(i => i.rawMaterialId) || [], [product]);

  const availableToppings = useMemo(() => {
    if (!product || !product.availableToppings) return [];
    
    return product.availableToppings
      .map(toppingId => rawMaterials.find(m => m.id === toppingId))
      .filter((topping): topping is RawMaterial => 
        topping !== undefined && !productIngredients.includes(topping.id)
      );
  }, [rawMaterials, product, productIngredients]);

  const packagingOptions = useMemo(() => product?.packagingOptions || [], [product]);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
      setQuantity(1);
      // Set default packaging if available
      if (packagingOptions && packagingOptions.length > 0) {
        setSelectedPackagingId(packagingOptions[0].id);
      } else {
        setSelectedPackagingId(undefined);
      }
    }
  }, [isOpen, packagingOptions]);

  const selectedPackaging = useMemo(() => {
    return packagingOptions.find(p => p.id === selectedPackagingId);
  }, [packagingOptions, selectedPackagingId]);
  
  const toppingsPrice = useMemo(() => {
    return selectedToppings.reduce((sum, toppingIng) => {
        const toppingData = rawMaterials.find(m => m.id === toppingIng.rawMaterialId);
        return sum + (toppingData?.sellingPrice || 0);
    }, 0);
  }, [selectedToppings, rawMaterials]);

  // This check must happen AFTER all hooks are called.
  if (!product) {
    return null;
  }

  const basePrice = product.sellingPrice;
  const packagingPrice = selectedPackaging?.additionalPrice || 0;
  
  const finalUnitPrice = basePrice + packagingPrice + toppingsPrice;
  const totalPrice = finalUnitPrice * quantity;

  const handleCheckboxChange = (checked: boolean, topping: RawMaterial) => {
    setSelectedToppings(prev => {
      if (checked) {
        return [...prev, { rawMaterialId: topping.id, quantity: 1 }];
      } else {
        return prev.filter(t => t.rawMaterialId !== topping.id);
      }
    });
  };

  const handleAddToCart = () => {
    // If there are packaging options, a selection is mandatory.
    if (packagingOptions.length > 0 && !selectedPackagingId) {
       toast({
        title: "Pilih Ukuran",
        description: "Anda harus memilih ukuran kemasan terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart(product, productType, quantity, selectedToppings, selectedPackaging, finalUnitPrice);
    
    toast({
      title: "Ditambahkan ke Keranjang",
      description: `${quantity}x ${product.name}${selectedPackaging ? ` (${selectedPackaging.name})` : ''} telah ditambahkan.`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background border-primary font-body">
        <DialogHeader>
          <DialogTitle className="font-pacifico text-3xl text-primary">{product.name}</DialogTitle>
          <DialogDescription className="text-foreground/80">Pilih ukuran, tambahan, dan jumlah untuk pesanan Anda.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
          
          {packagingOptions.length > 0 && (
            <div className="space-y-2">
                <h4 className="font-bold text-foreground">Ukuran</h4>
                <RadioGroup value={selectedPackagingId} onValueChange={setSelectedPackagingId} className="grid grid-cols-2 gap-2">
                    {packagingOptions.map((pack) => (
                        <Label key={pack.id} htmlFor={pack.id} className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 p-3 hover:bg-primary/10 cursor-pointer transition-colors",
                            selectedPackagingId === pack.id ? "bg-primary text-primary-foreground border-primary" : "border-input bg-card/50 text-foreground"
                        )}>
                            <RadioGroupItem value={pack.id} id={pack.id} className="sr-only" />
                            <span className="font-bold">{pack.name}</span>
                            <span className="text-xs">+{formatCurrency(pack.additionalPrice)}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-foreground mb-2">Topping</h4>
              {availableToppings.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                  {availableToppings.map(topping => (
                    <div key={topping.id} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`topping-${topping.id}`}
                          onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, topping)}
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <Label htmlFor={`topping-${topping.id}`} className="text-foreground">{topping.name}</Label>
                      </div>
                      {topping.sellingPrice != null && (
                        <span className="text-sm text-foreground">+{formatCurrency(topping.sellingPrice)}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Tidak ada topping tersedia.</p>
              )}
            </div>
             <div>
                <h4 className="font-bold text-foreground mb-2">Jumlah</h4>
                <div className="flex items-center justify-center gap-4 border rounded-lg p-2 bg-card/50">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-primary text-primary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                    <span className="text-2xl font-bold w-12 text-center text-foreground">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent border-primary text-primary" onClick={() => setQuantity(q => q + 1)}>+</Button>
                </div>
            </div>
          </div>
        </div>
        <Separator className="bg-primary/20 !my-2" />
        <div className="flex justify-between items-center text-xl font-bold text-foreground">
            <span>Total Harga</span>
            <span>{formatCurrency(totalPrice)}</span>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg py-6"><Plus className="mr-2 h-4 w-4" /> Tambahkan ke Keranjang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Order Summary Panel (for Desktop) ---
function OrderSummaryPanel({ onConfirm }: { onConfirm: () => void }) {
  const { cart, updateCartItemQuantity, removeFromCart, rawMaterials } = useAppContext();

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  return (
    <Card className="bg-card backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader className="p-6">
        <CardTitle className="font-pacifico text-3xl text-primary">Keranjang Anda</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[50vh] overflow-y-auto space-y-4">
        {cart.length > 0 ? (
          cart.map(item => (
            <div key={item.cartId} className="flex gap-4">
              <div className="flex-1">
                <p className="font-bold text-foreground">
                  {item.name} {item.selectedPackagingName && `(${item.selectedPackagingName})`}
                </p>
                 <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                    {item.selectedToppings && item.selectedToppings.length > 0 ? (
                      item.selectedToppings.map(topping => {
                         const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                         return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>
                      })
                    ) : (
                      <li className="list-none italic">Tanpa topping tambahan.</li>
                    )}
                  </ul>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-primary text-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}>-</Button>
                  <span className="w-8 text-center text-lg font-bold text-foreground">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-primary text-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}>+</Button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                  <p className="font-semibold text-foreground">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => removeFromCart(item.cartId)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center py-8">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Keranjang Anda kosong.</p>
              <p className="text-sm">Pilih item dari menu.</p>
          </div>
        )}
      </CardContent>
       {cart.length > 0 && (
        <CardFooter className="flex-col items-stretch space-y-4">
          <Separator className="bg-primary/20" />
          <div className="flex justify-between font-bold text-lg text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button onClick={onConfirm} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6">Masukkan Pesanan</Button>
        </CardFooter>
      )}
    </Card>
  );
}


// --- Order Summary Sheet (for Mobile) ---
function OrderSummarySheet({ onConfirm }: { onConfirm: () => void }) {
  const { cart, updateCartItemQuantity, removeFromCart, rawMaterials } = useAppContext();

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground z-20">
          <ShoppingCart className="h-8 w-8" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-background border-primary/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-pacifico text-3xl text-primary">Keranjang Anda</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.cartId} className="flex gap-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    {item.name} {item.selectedPackagingName && `(${item.selectedPackagingName})`}
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                    {item.selectedToppings && item.selectedToppings.length > 0 ? (
                      item.selectedToppings.map(topping => {
                         const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                         return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>
                      })
                    ) : (
                       <li className="list-none italic">Tanpa topping tambahan.</li>
                    )}
                  </ul>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-primary text-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center text-lg font-bold text-foreground">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent border-primary text-primary" onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}>+</Button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="font-semibold text-foreground">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => removeFromCart(item.cartId)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Keranjang Anda masih kosong.</p>
                <p className="text-sm">Silakan pilih item dari menu.</p>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <SheetFooter className="border-t border-primary/20 pt-4 -mx-6 px-6">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-bold text-lg text-foreground">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <SheetClose asChild>
                <Button onClick={onConfirm} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6">Masukkan Pesanan</Button>
              </SheetClose>
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

  const hotDrinks = useMemo(() => drinks.filter(d => d.temperature === 'hot'), [drinks]);
  const coldDrinks = useMemo(() => drinks.filter(d => d.temperature === 'cold' || !d.temperature), [drinks]);


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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map(item => (
              <Card 
                key={item.id} 
                className="flex flex-col overflow-hidden group cursor-pointer rounded-2xl bg-card backdrop-blur-sm border-2 border-primary/10 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" 
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
                     <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                        {formatCurrency(item.sellingPrice)}
                    </div>
                  </div>
                <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-bold truncate text-foreground">{item.name}</h3>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg">
                      <Plus className="mr-2 h-4 w-4" /> Pesan
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-lg text-center h-48 bg-card">
            <p className="text-foreground font-semibold">Menu {type === 'drink' ? 'Minuman' : 'Makanan'} Akan Segera Hadir!</p>
            <p className="text-sm text-muted-foreground mt-1">Nantikan produk-produk menarik dari kami.</p>
          </div>
      );
  }

  return (
    <MainLayout>
        <div className="fixed inset-0 -z-10 bg-background">
            <div className="relative w-full h-full">
                <DecorativeBlob1 />
                <DecorativeBlob2 />
            </div>
        </div>
        
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
                <AlertDialogContent className="bg-background border-primary font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-pacifico text-3xl text-primary text-center">Pesanan Diterima!</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-lg text-foreground pt-4">
                        Nomor antrian Anda adalah:
                        </AlertDialogDescription>
                        <div className="flex justify-center items-center py-4">
                            <div className="flex justify-center items-center h-32 w-32 rounded-full bg-secondary text-secondary-foreground border-4 border-white shadow-lg">
                                <span className="text-6xl font-bold">{newQueueNumber}</span>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col items-center text-center mb-16">
                    <h1 className="font-pacifico text-5xl md:text-7xl text-primary tracking-tight">Selamat Datang di <span className="text-secondary">{appName}</span></h1>
                    <p className="text-xl text-foreground mt-4 max-w-2xl font-body">
                        Pilih menu favorit Anda di bawah ini dan nikmati sensasi rasa yang tak terlupakan.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-20">
                        {/* Hot Drinks Section */}
                        {hotDrinks.length > 0 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-accent/80 p-3 rounded-full shadow-sm">
                                        <Flame className="h-8 w-8 text-primary"/>
                                    </div>
                                    <h2 className="font-pacifico text-5xl text-primary">Minuman Panas</h2>
                                    <div className="flex-grow h-1 bg-gradient-to-r from-accent/50 to-transparent rounded-full" />
                                </div>
                                {renderProductGrid(hotDrinks, 'drink')}
                            </div>
                        )}

                        {/* Cold Drinks Section */}
                        {coldDrinks.length > 0 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="bg-accent/80 p-3 rounded-full shadow-sm">
                                        <Snowflake className="h-8 w-8 text-primary"/>
                                    </div>
                                    <h2 className="font-pacifico text-5xl text-primary">Minuman Dingin</h2>
                                    <div className="flex-grow h-1 bg-gradient-to-r from-accent/50 to-transparent rounded-full" />
                                </div>
                                {renderProductGrid(coldDrinks, 'drink')}
                            </div>
                        )}

                        {/* Makanan Section */}
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                            <div className="bg-accent/80 p-3 rounded-full shadow-sm">
                                <Utensils className="h-8 w-8 text-primary"/>
                            </div>
                                <h2 className="font-pacifico text-5xl text-primary">Makanan</h2>
                                <div className="flex-grow h-1 bg-gradient-to-r from-accent/50 to-transparent rounded-full" />
                            </div>
                            {renderProductGrid(foods, 'food')}
                        </div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1 sticky top-24">
                       <OrderSummaryPanel onConfirm={handleConfirmOrder} />
                    </div>
                </div>
            </div>
        </div>
        <OrderSummarySheet onConfirm={handleConfirmOrder} />
    </MainLayout>
  );
}
