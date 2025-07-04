"use client";

import React, { useState, useMemo, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Drink, Food, RawMaterial } from "@/lib/types";
import { PlusCircle, Edit, Trash2, X, ImageIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// --- Schemas ---
const ingredientSchema = z.object({
  rawMaterialId: z.string().min(1, "Pilih bahan"),
  quantity: z.coerce.number().min(0.01, "Jumlah > 0"),
});

const productSchema = z.object({
  name: z.string().min(1, "Nama produk tidak boleh kosong"),
  imageUri: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  ingredients: z.array(ingredientSchema).min(1, "Minimal 1 bahan baku"),
  availableToppings: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;
type Product = Drink | Food;


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
                <CardDescription>Berdasarkan HPP di samping.</CardDescription>
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

// --- Form Component ---
interface ProductFormProps {
  productType: 'minuman' | 'makanan';
  rawMaterials: RawMaterial[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<any>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<any>;
  onFinished: () => void;
}

const ProductForm = React.forwardRef<
    { handleEdit: (product: Product) => void },
    ProductFormProps
>(({ productType, rawMaterials, addProduct, updateProduct, onFinished }, ref) => {
    const { toast } = useToast();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const productTypeName = productType === 'minuman' ? 'Minuman' : 'Makanan';
    
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: { name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], imageUri: undefined, availableToppings: [] },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "ingredients" });
    const watchedIngredients = useWatch({ control: form.control, name: 'ingredients' });

    const allToppings = useMemo(() => rawMaterials.filter(m => m.category === 'topping'), [rawMaterials]);

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
            form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], imageUri: undefined, availableToppings: [] });
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
                availableToppings: product.availableToppings || [],
            });
        }
    }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) { // 1MB limit
            toast({
                title: "Ukuran File Terlalu Besar",
                description: "Silakan pilih gambar dengan ukuran di bawah 1MB.",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama {productTypeName}</FormLabel><FormControl><Input {...field} placeholder={`cth: ${productType === 'minuman' ? 'Es Kopi Susu' : 'Nasi Goreng'}`} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem><FormLabel>Harga Jual</FormLabel><FormControl><Input type="number" {...field} placeholder={`cth: ${productType === 'minuman' ? '18000' : '25000'}`} /></FormControl><FormMessage /></FormItem>
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
                
                <div>
                    <FormLabel>Resep / Bahan Baku</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                           <FormField control={form.control} name={`ingredients.${index}.rawMaterialId`} render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih bahan baku..." /></SelectTrigger></FormControl>
                                    <SelectContent>{rawMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>)}</SelectContent>
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
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><X className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ rawMaterialId: "", quantity: 1 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Bahan
                    </Button>
                    </div>
                </div>

                <div className="space-y-2">
                  <FormLabel>Topping yang Tersedia (Opsional)</FormLabel>
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
                        <Card><CardHeader><CardTitle>Rincian Harga Pokok (HPP)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(calculatedCostPrice)}</p></CardContent></Card>
                    </div>
                    <div><PriceSuggestionCalculator costPrice={calculatedCostPrice} /></div>
                </div>
                
                <Button type="submit">{editingProduct ? "Simpan Perubahan" : `Tambah ${productTypeName}`}</Button>
                {editingProduct && (<Button type="button" variant="ghost" onClick={() => { setEditingProduct(null); setPreview(null); form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }], availableToppings: [] }); }}>Batal Edit</Button>)}
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
    const formRef = useRef<{ handleEdit: (product: Product) => void }>(null);

    const productTypeName = productType === 'minuman' ? 'Minuman' : 'Makanan';

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
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Manajemen {productTypeName}</h1>
                <Button onClick={() => setFormVisible(!isFormVisible)}>
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
                <CardHeader><CardTitle>Daftar {productTypeName}</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama {productTypeName}</TableHead>
                                <TableHead>Harga Pokok</TableHead>
                                <TableHead>Harga Jual</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                            products.map(product => (
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
                                      {product.name}
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
                                    Belum ada data {productType}.
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
