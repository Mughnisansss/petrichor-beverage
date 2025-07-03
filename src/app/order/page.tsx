
"use client";

import React, { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CupSoda, Utensils, Plus } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { Separator } from "@/components/ui/separator";
import type { Drink, Food, RawMaterial, Ingredient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  // Memoize topping list to prevent re-filtering on every render
  const availableToppings = useMemo(() => rawMaterials.filter(m => m.category === 'topping'), [rawMaterials]);

  if (!product) return null;

  const handleCheckboxChange = (checked: boolean, topping: RawMaterial) => {
    setSelectedToppings(prev => {
      if (checked) {
        // Assume quantity 1 for toppings, as per standard cafe logic
        return [...prev, { rawMaterialId: topping.id, quantity: 1 }];
      } else {
        return prev.filter(t => t.rawMaterialId !== topping.id);
      }
    });
  };

  const handleAddToCart = () => {
    // Calculate the total price of selected toppings
    const toppingsPrice = selectedToppings.reduce((sum, toppingIng) => {
        const toppingData = rawMaterials.find(m => m.id === toppingIng.rawMaterialId);
        // Add the topping's selling price to the sum, default to 0 if not set
        return sum + (toppingData?.sellingPrice || 0);
    }, 0);

    // Final unit price is the product's base price plus the price of all toppings
    const finalUnitPrice = product.sellingPrice + toppingsPrice;
    
    // Add to cart with the final calculated price
    addToCart(product, productType, selectedToppings, finalUnitPrice);
    
    toast({
      title: "Ditambahkan ke Orderan",
      description: `1x ${product.name} telah ditambahkan.`,
    });
    
    // Close dialog and reset local state for next use
    onClose();
    setSelectedToppings([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            onClose();
            setSelectedToppings([]);
        }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Pilih tambahan untuk pesanan Anda.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h4 className="font-semibold">Topping</h4>
          {availableToppings.length > 0 ? (
            <div className="space-y-2">
              {availableToppings.map(topping => (
                <div key={topping.id} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`topping-${topping.id}`}
                      onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, topping)}
                    />
                    <Label htmlFor={`topping-${topping.id}`}>{topping.name}</Label>
                  </div>
                  {topping.sellingPrice && (
                    <span className="text-sm text-muted-foreground">+{formatCurrency(topping.sellingPrice)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada topping tersedia saat ini.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart}><Plus className="mr-2 h-4 w-4" /> Tambahkan ke Orderan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Main Page Component ---
export default function OrderPage() {
  const { drinks, foods, appName } = useAppContext();
  const [customizingProduct, setCustomizingProduct] = useState<Drink | Food | null>(null);
  const [productType, setProductType] = useState<'drink' | 'food'>('drink');

  const handleOrderClick = (product: Drink | Food, type: 'drink' | 'food') => {
    setProductType(type);
    setCustomizingProduct(product);
  };
  
  const renderProductGrid = (products: (Drink[] | Food[]), type: 'drink' | 'food') => {
     return products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(item => (
              <Card key={item.id} className="flex flex-col text-left cursor-pointer hover:border-primary" onClick={() => handleOrderClick(item, type)}>
                  <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-xl font-semibold text-primary">{formatCurrency(item.sellingPrice)}</p>
                  </CardContent>
                  <CardFooter>
                      <Button className="w-full">
                          Pesan
                      </Button>
                  </CardFooter>
              </Card>
          ))}
        </div>
      ) : (
          <p className="text-muted-foreground">Menu {type === 'drink' ? 'minuman' : 'makanan'} akan segera hadir.</p>
      );
  }

  return (
    <MainLayout>
        <ProductCustomizationDialog 
          isOpen={customizingProduct !== null}
          onClose={() => setCustomizingProduct(null)}
          product={customizingProduct}
          productType={productType}
        />

        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Selamat Datang di {appName}</h1>
            <p className="text-lg text-muted-foreground mt-2">Silakan lihat menu kami di bawah ini.</p>
        </div>

        <div className="space-y-12">
            {/* Minuman Section */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <CupSoda className="h-8 w-8 text-primary"/>
                    <h2 className="text-3xl font-bold">Minuman</h2>
                </div>
                {renderProductGrid(drinks, 'drink')}
            </div>

            <Separator />

            {/* Makanan Section */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Utensils className="h-8 w-8 text-primary"/>
                    <h2 className="text-3xl font-bold">Makanan</h2>
                </div>
                {renderProductGrid(foods, 'food')}
            </div>
        </div>
    </MainLayout>
  );
}
