
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CupSoda, Utensils, Plus } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import type { Drink, Food, RawMaterial, Ingredient } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  const availableToppings = useMemo(() => rawMaterials.filter(m => m.category === 'topping'), [rawMaterials]);

  if (!product) return null;

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
    const toppingsPrice = selectedToppings.reduce((sum, toppingIng) => {
        const toppingData = rawMaterials.find(m => m.id === toppingIng.rawMaterialId);
        return sum + (toppingData?.sellingPrice || 0);
    }, 0);

    const finalUnitPrice = product.sellingPrice + toppingsPrice;
    
    addToCart(product, productType, selectedToppings, finalUnitPrice);
    
    toast({
      title: "Ditambahkan ke Orderan",
      description: `1x ${product.name} telah ditambahkan.`,
    });
    
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
      <DialogContent className="bg-order-bg border-order-primary font-body">
        <DialogHeader>
          <DialogTitle className="font-pacifico text-3xl text-order-primary">{product.name}</DialogTitle>
          <DialogDescription className="text-order-text/80">Pilih tambahan untuk pesanan Anda.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h4 className="font-bold text-order-text">Topping</h4>
          {availableToppings.length > 0 ? (
            <div className="space-y-2">
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
                  {topping.sellingPrice && (
                    <span className="text-sm text-order-text/80">+{formatCurrency(topping.sellingPrice)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-order-text/80">Tidak ada topping tersedia saat ini.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} className="bg-order-secondary hover:bg-order-secondary/90 text-white font-bold"><Plus className="mr-2 h-4 w-4" /> Tambahkan ke Orderan</Button>
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
            <ProductCustomizationDialog 
              isOpen={customizingProduct !== null}
              onClose={() => setCustomizingProduct(null)}
              product={customizingProduct}
              productType={productType}
            />

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
        </div>
    </MainLayout>
  );
}
