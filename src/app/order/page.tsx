
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(item => (
              <Card 
                key={item.id} 
                className="flex flex-col overflow-hidden group cursor-pointer rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2" 
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
                     <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        {formatCurrency(item.sellingPrice)}
                    </div>
                  </div>
                <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-bold truncate">{item.name}</h3>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Pesan
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center h-48">
            <p className="text-muted-foreground font-semibold">Menu {type === 'drink' ? 'Minuman' : 'Makanan'} Akan Segera Hadir!</p>
            <p className="text-sm text-muted-foreground mt-1">Nantikan produk-produk menarik dari kami.</p>
          </div>
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

        <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight">Selamat Datang di <span className="text-primary">{appName}</span></h1>
            <p className="text-xl text-muted-foreground mt-3">
                Pilih menu favorit Anda di bawah ini
            </p>
        </div>

        <div className="space-y-16">
            {/* Minuman Section */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <CupSoda className="h-8 w-8 text-primary"/>
                    </div>
                    <h2 className="text-4xl font-bold">Minuman</h2>
                    <Separator className="flex-grow bg-primary/20 h-1" />
                </div>
                {renderProductGrid(drinks, 'drink')}
            </div>

            {/* Makanan Section */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                     <div className="bg-primary/10 p-3 rounded-full">
                        <Utensils className="h-8 w-8 text-primary"/>
                    </div>
                    <h2 className="text-4xl font-bold">Makanan</h2>
                    <Separator className="flex-grow bg-primary/20 h-1" />
                </div>
                {renderProductGrid(foods, 'food')}
            </div>
        </div>
    </MainLayout>
  );
}
