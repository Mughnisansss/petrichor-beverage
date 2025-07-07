
"use client";

import React, { useState, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Drink, Food, RawMaterial, PackagingInfo } from "@/lib/types";
import { PlusCircle, Edit, Trash2, X, ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// --- Schemas ---
const ingredientSchema = z.object({
  rawMaterialId: z.string().min(1, "Pilih bahan"),
  quantity: z.coerce.number().min(0.01, "Jumlah > 0"),
});

const packagingInfoSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama ukuran tidak boleh kosong."),
  additionalPrice: z.coerce.number().min(0, "Harga tambahan tidak boleh negatif.").default(0),
  ingredients: z.array(ingredientSchema).min(1, "Kemasan harus memiliki setidaknya 1 bahan."),
});

// --- Helper Components ---
const PriceSuggestionCalculator = ({ costPrice }: { costPrice: number }) => {
    const getSuggestedPrice = (margin: number) => {
        if (costPrice <= 0 || margin >= 100) return 0;
        return costPrice / (1 - (margin / 100));
    }

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="text-lg">Saran Harga Jual</CardTitle>
                <CardDescription>Berdasarkan HPP Isi Produk & harga dasar.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Margin 50%</span>
                        <span className="font-bold text-primary">{formatCurrency(getSuggestedPrice(50))}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Margin 60%</span>
                        <span className="font-bold text-primary">{formatCurrency(getSuggestedPrice(60))}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Margin 70%</span>
                        <span className="font-bold text-primary">{formatCurrency(getSuggestedPrice(70))}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Helper component for Packaging Options in Form to fix Hooks order error ---
const PackagingOptionAccordionItem = ({
  packIndex,
  packagingItem,
  removePackaging,
  control,
  packagingMaterials
}: {
  packIndex: number;
  packagingItem: Record<"id", string>;
  removePackaging: (index: number) => void;
  control: any;
  packagingMaterials: RawMaterial[];
}) => {
  const { fields: subFields, append: subAppend, remove: subRemove } = useFieldArray({
    control,
    name: `packagingOptions.${packIndex}.ingredients`,
  });

  return (
    <AccordionItem value={packagingItem.id} className="border rounded-lg px-4 bg-muted/30">
      <AccordionTrigger>
        {`Opsi Ukuran #${packIndex + 1}`}
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={control} name={`packagingOptions.${packIndex}.name`} render={({ field }) => (
              <FormItem><FormLabel>Nama Ukuran</FormLabel><FormControl><Input {...field} placeholder="cth: Reguler" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`packagingOptions.${packIndex}.additionalPrice`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Tambahan Harga Jual</FormLabel>
                    <FormControl><Input type="number" {...field} placeholder="cth: 3000" /></FormControl>
                    <FormDescription>Harga tambahan untuk ukuran ini.</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}/>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Bahan Kemasan</Label>
            <div className="space-y-2">
              {subFields.map((subItem, subIndex) => (
                <div key={subItem.id} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => subRemove(subIndex)} disabled={subFields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                  <FormField control={control} name={`packagingOptions.${packIndex}.ingredients.${subIndex}.rawMaterialId`} render={({ field }) => (
                    <FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih bahan kemasan..." /></SelectTrigger></FormControl><SelectContent>{packagingMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={control} name={`packagingOptions.${packIndex}.ingredients.${subIndex}.quantity`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" step="1" {...field} className="w-28" placeholder="Jumlah" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => subAppend({ rawMaterialId: "", quantity: 1 })}><PlusCircle className="mr-2 h-4 w-4" />Tambah Bahan</Button>
            </div>
          </div>
          <Separator className="!my-4"/>
          <div className="flex justify-end">
              <Button type="button" variant="destructive" size="sm" onClick={() => removePackaging(packIndex)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Opsi Ukuran
              </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};


// --- Form Component ---
interface ProductFormProps {
  productType: 'minuman' | 'makanan';
  rawMaterials: RawMaterial[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<any>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<any>;
  onFinished: () => void;
}

type Product = Drink | Food;

const ProductForm = React.forwardRef<
    { handleEdit: (product: Product) => void; handleNew: (subCategory?: string) => void; },
    ProductFormProps
>(({ productType, rawMaterials, addProduct, updateProduct, onFinished }, ref) => {
    const { toast } = useToast();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const productTypeName = productType === 'minuman' ? 'Minuman' : 'Makanan';
    
    const productSchema = z.object({
        name: z.string().min(1, "Nama produk tidak boleh kosong"),
        imageUri: z.string().optional(),
        sellingPrice: z.coerce.number().min(0, "Harga jual dasar tidak boleh negatif."),
        subCategory: z.string().optional(),
        ingredients: z.array(ingredientSchema).min(1, "Produk harus memiliki setidaknya 1 bahan isi."),
        availableToppings: z.array(z.string()).optional(),
        packagingOptions: z.array(packagingInfoSchema).optional(),
    });

    type ProductFormValues = z.infer<typeof productSchema>;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], imageUri: undefined, subCategory: "", availableToppings: [], packagingOptions: [] },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "ingredients" });
    const { fields: packagingFields, append: appendPackaging, remove: removePackaging } = useFieldArray({ control: form.control, name: "packagingOptions" });
    const watchedIngredients = useWatch({ control: form.control, name: 'ingredients' });

    const allToppings = useMemo(() => rawMaterials.filter(m => m.category === 'topping'), [rawMaterials]);
    const packagingMaterials = useMemo(() => rawMaterials.filter(m => m.category === 'packaging'), [rawMaterials]);
    const contentMaterials = useMemo(() => rawMaterials.filter(m => m.category === 'main'), [rawMaterials]);

    const calculatedCostPrice = useMemo(() => {
        if (!watchedIngredients || rawMaterials.length === 0) return 0;
        return watchedIngredients.reduce((acc, item) => {
            const material = rawMaterials.find(m => m.id === item.rawMaterialId);
            const cost = material ? material.costPerUnit * item.quantity : 0;
            return acc + cost;
        }, 0);
    }, [watchedIngredients, rawMaterials]);

    async function onSubmit(values: ProductFormValues) {
        try {
            const productData = { ...values, costPrice: calculatedCostPrice };
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
                toast({ title: "Sukses", description: `${productTypeName} berhasil diperbarui.` });
            } else {
                await addProduct(productData);
                toast({ title: "Sukses", description: `${productTypeName} berhasil ditambahkan.` });
            }
            onFinished();
            setEditingProduct(null);
            setPreview(null);
            form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], imageUri: undefined, subCategory: "", availableToppings: [], packagingOptions: [] });
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }
    
    React.useImperativeHandle(ref, () => ({
        handleEdit: (product: Product) => {
            setEditingProduct(product);
            setPreview(product.imageUri || null);
            form.reset({
                ...product,
                subCategory: product.subCategory || "",
                availableToppings: product.availableToppings || [],
                packagingOptions: product.packagingOptions || [],
            });
        },
        handleNew: (subCategory?: string) => {
            setEditingProduct(null);
            setPreview(null);
            form.reset({ 
                name: "", 
                sellingPrice: 0, 
                ingredients: [{ rawMaterialId: "", quantity: 1 }], 
                imageUri: undefined, 
                subCategory: subCategory || "", 
                availableToppings: [], 
                packagingOptions: [] 
            });
        }
    }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                title: "Ukuran File Terlalu Besar",
                description: "Silakan pilih gambar dengan ukuran di bawah 5MB.",
                variant: "destructive"
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            form.setValue('imageUri', result, { shouldDirty: true });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setPreview(null);
        form.setValue('imageUri', undefined, { shouldDirty: true });
    };

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama {productTypeName}</FormLabel><FormControl><Input {...field} placeholder={`cth: ${productType === 'minuman' ? 'Es Kopi Susu' : 'Nasi Goreng'}`} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="subCategory" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sub-Kategori (Opsional)</FormLabel>
                            <FormControl><Input {...field} placeholder="cth: Panas, Dingin, Jus, Gorengan..." /></FormControl>
                            <FormDescription>Beri sub-kategori agar mudah dikelompokkan di menu.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem><FormLabel>Harga Jual Dasar</FormLabel><FormControl><Input type="number" {...field} placeholder={`cth: 15000`} /></FormControl><FormDescription>Harga untuk ukuran terkecil/default.</FormDescription><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUpload">Gambar Produk (Opsional)</Label>
                     <div className="flex items-center gap-4">
                        {preview ? (
                            <Image
                                src={preview}
                                alt="Pratinjau produk"
                                width={96}
                                height={96}
                                className="h-24 w-24 rounded-md object-cover border"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-md border bg-muted flex items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                             <Label htmlFor="imageUpload" className={cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer")}>
                                <Upload className="h-4 w-4" /> Unggah
                             </Label>
                            <Input
                                id="imageUpload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                           
                            {preview && (
                                <Button variant="ghost" size="sm" onClick={handleRemoveImage} className="justify-start text-destructive hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </Button>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
                
                <Separator/>

                <div>
                    <FormLabel className="text-base font-semibold">Resep Isi Produk</FormLabel>
                    <FormDescription>Bahan-bahan utama untuk membuat produk ini (di luar kemasan).</FormDescription>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                           <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                           <FormField control={form.control} name={`ingredients.${index}.rawMaterialId`} render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih bahan isi..." /></SelectTrigger></FormControl>
                                    <SelectContent>{contentMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input type="number" step="0.01" {...field} className="w-28" placeholder="Jumlah"/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ rawMaterialId: "", quantity: 1 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Bahan Isi
                    </Button>
                    </div>
                </div>
                
                <Separator/>

                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Opsi Kemasan / Ukuran</FormLabel>
                   <FormDescription>Definisikan berbagai ukuran yang tersedia untuk produk ini.</FormDescription>
                    <Accordion type="multiple" className="w-full space-y-3">
                       {packagingFields.map((packagingItem, packIndex) => (
                         <PackagingOptionAccordionItem
                           key={packagingItem.id}
                           packIndex={packIndex}
                           packagingItem={packagingItem}
                           removePackaging={removePackaging}
                           control={form.control}
                           packagingMaterials={packagingMaterials}
                         />
                       ))}
                    </Accordion>
                     <Button type="button" variant="secondary" size="sm" onClick={() => appendPackaging({ id: nanoid(), name: "", additionalPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }] })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Opsi Ukuran
                    </Button>
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <FormLabel className="text-base font-semibold">Topping yang Tersedia (Opsional)</FormLabel>
                  <FormDescription>Pilih topping mana saja yang bisa ditambahkan pelanggan ke produk ini.</FormDescription>
                  <FormField
                    control={form.control}
                    name="availableToppings"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 rounded-md border p-4">
                        {allToppings.length === 0 && (
                          <p className="text-sm text-muted-foreground col-span-full">Tidak ada bahan baku dengan kategori 'Topping'. Silakan tambahkan terlebih dahulu di halaman 'Bahan Baku'.</p>
                        )}
                        {allToppings.map((topping) => (
                          <FormField
                            key={topping.id}
                            control={form.control}
                            name="availableToppings"
                            render={({ field }) => {
                              return (
                                <FormItem key={topping.id} className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(topping.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), topping.id])
                                          : field.onChange(
                                              (field.value || []).filter(
                                                (value) => value !== topping.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {topping.name} (+{formatCurrency(topping.sellingPrice || 0)})
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <Card><CardHeader><CardTitle>HPP Isi Produk</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(calculatedCostPrice)}</p><FormDescription>Biaya pokok untuk bahan-bahan isi saja, di luar kemasan dan topping.</FormDescription></CardContent></Card>
                    </div>
                    <div><PriceSuggestionCalculator costPrice={calculatedCostPrice} /></div>
                </div>
                
                <Button type="submit">{editingProduct ? "Simpan Perubahan" : `Tambah ${productTypeName}`}</Button>
                {editingProduct && (<Button type="button" variant="ghost" onClick={() => { setEditingProduct(null); setPreview(null); form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], availableToppings: [], packagingOptions: [] }); }}>Batal Edit</Button>)}
            </form>
        </Form>
    );
});
ProductForm.displayName = 'ProductForm';


// --- Main Manager Component ---
interface ProductManagerProps {
  productType: 'minuman' | 'makanan';
  products: Product[];
  rawMaterials: RawMaterial[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<any>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<any>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message: string }>;
}

export function ProductManager({ productType, products, rawMaterials, addProduct, updateProduct, deleteProduct }: ProductManagerProps) {
    const { toast } = useToast();
    const [isFormVisible, setFormVisible] = useState(false);
    const formRef = useRef<{ handleEdit: (product: Product) => void; handleNew: (subCategory?: string) => void; }>(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const productTypeName = productType === 'minuman' ? 'Minuman' : 'Makanan';

    const subCategories = useMemo(() => {
        const categories = new Set(products.map(p => p.subCategory).filter(Boolean) as string[]);
        return ['all', ...Array.from(categories)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (categoryFilter === 'all') {
            return products;
        }
        return products.filter(p => p.subCategory === categoryFilter);
    }, [products, categoryFilter]);
    
    const handleAddNewCategory = () => {
        if (!newCategoryName.trim()) {
            toast({ title: "Nama kategori tidak boleh kosong", variant: "destructive" });
            return;
        }
        setCategoryFilter(newCategoryName);
        if (formRef.current) {
            formRef.current.handleNew(newCategoryName);
            if (!isFormVisible) {
                setFormVisible(true);
            }
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }
        setAddCategoryOpen(false);
        setNewCategoryName("");
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${productType} ini? Riwayat penjualan tidak akan terhapus.`)) return;
        try {
            const result = await deleteProduct(id);
            if (!result.ok) throw new Error(result.message);
            toast({ title: "Sukses", description: result.message });
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };

    const handleEditClick = (product: Product) => {
        setFormVisible(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            formRef.current?.handleEdit(product);
        }, 50);
    }

    const handleToggleForm = () => {
        if (isFormVisible) {
            setFormVisible(false);
        } else {
            setFormVisible(true);
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const subCategory = categoryFilter !== 'all' ? categoryFilter : '';
                formRef.current?.handleNew(subCategory);
            }, 50);
        }
    };
    
    return (
        <div className="flex flex-col gap-8">
            <Dialog open={isAddCategoryOpen} onOpenChange={setAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>Masukkan nama untuk sub-kategori baru. Ini akan otomatis terpakai saat Anda membuat produk baru.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="new-category-name">Nama Kategori</Label>
                        <Input
                            id="new-category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="cth: Jus, Kopi Spesial, Pastry"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>Batal</Button>
                        <Button onClick={handleAddNewCategory}>Tambah & Lanjutkan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Manajemen {productTypeName}</h1>
                <Button onClick={handleToggleForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {isFormVisible ? "Tutup Form" : `Tambah ${productTypeName}`}
                </Button>
            </div>

            {isFormVisible && (
                <Card>
                    <CardHeader>
                         <CardTitle>Form {productTypeName}</CardTitle>
                         <CardDescription>Tambah {productType} baru atau pilih dari daftar di bawah untuk mengedit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ProductForm 
                         ref={formRef} 
                         onFinished={() => setFormVisible(false)} 
                         productType={productType}
                         rawMaterials={rawMaterials}
                         addProduct={addProduct}
                         updateProduct={updateProduct}
                       />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daftar {productTypeName}</CardTitle>
                            <CardDescription>Lihat dan kelola semua {productType} yang terdaftar.</CardDescription>
                        </div>
                        <div className="w-full max-w-[200px]">
                            <Select value={categoryFilter} onValueChange={(value) => {
                                if (value === 'add_new_category_trigger') {
                                    setAddCategoryOpen(true);
                                } else {
                                    setCategoryFilter(value);
                                }
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Semua Kategori' : cat}</SelectItem>
                                    ))}
                                    <SelectSeparator />
                                     <SelectItem value="add_new_category_trigger" className="text-primary focus:text-primary">
                                        <div className="flex items-center gap-2">
                                            <PlusCircle className="h-4 w-4" />
                                            <span>Tambah Kategori Baru...</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama {productTypeName}</TableHead>
                                <TableHead>Harga Pokok (Isi)</TableHead>
                                <TableHead>Harga Jual (Dasar)</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                      <Image 
                                        src={product.imageUri || `https://placehold.co/100x100.png`}
                                        alt={product.name}
                                        width={40}
                                        height={40}
                                        className="rounded-md object-cover h-10 w-10"
                                        data-ai-hint={productType === 'minuman' ? "drink beverage" : "food meal"}
                                      />
                                      <div>
                                        {product.name}
                                        {product.subCategory && (
                                            <Badge variant="outline" className="ml-2 capitalize">
                                            {product.subCategory}
                                            </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                                    <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                                    <TableCell className="flex gap-2 justify-end">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Belum ada data {productType} untuk kategori ini.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
