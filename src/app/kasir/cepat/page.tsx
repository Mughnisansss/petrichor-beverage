
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, CupSoda, Utensils, Flame, Snowflake } from "lucide-react";
import type { Drink, Food, Sale, Ingredient, RawMaterial } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

// Helper Component: Quick Sell Customization Dialog
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
        <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
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


export default function PenjualanCepatPage() {
    const { drinks, foods, addSale } = useAppContext();
    const { toast } = useToast();
    const [isCustomizeDialogOpen, setCustomizeDialogOpen] = useState(false);
    const [customizingProductInfo, setCustomizingProductInfo] = useState<{product: Drink | Food, type: 'drink' | 'food'} | null>(null);

    const hotDrinks = useMemo(() => drinks.filter(d => d.temperature === 'hot'), [drinks]);
    const coldDrinks = useMemo(() => drinks.filter(d => d.temperature === 'cold' || !d.temperature), [drinks]);


    async function handleQuickSell(product: Drink | Food, type: 'drink' | 'food') {
        const hasToppings = product.availableToppings && product.availableToppings.length > 0;
        const hasPackaging = product.packagingOptions && product.packagingOptions.length > 0;

        if (hasToppings || hasPackaging) {
            setCustomizingProductInfo({ product, type });
            setCustomizeDialogOpen(true);
            return;
        }
        
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
                Belum ada data {type === 'drink' ? 'minuman' : 'makanan'} untuk kategori ini.
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
    <>
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
        <Card>
            <CardHeader>
                <CardTitle>Kasir Penjualan Cepat</CardTitle>
                <CardDescription>Klik tombol pada item untuk mencatat penjualan. Jika ada kustomisasi (ukuran/topping), dialog akan muncul.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Minuman Panas</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {renderProductGrid(hotDrinks, 'drink')}
                    </div>
                </div>
                <Separator />
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Snowflake className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Minuman Dingin</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {renderProductGrid(coldDrinks, 'drink')}
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
    </>
    );
}
