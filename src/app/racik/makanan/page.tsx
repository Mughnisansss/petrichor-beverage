"use client";

import React, { useState, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import type { Food } from "@/lib/types";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { addDays, isWithinInterval, parseISO } from "date-fns";

const ingredientSchema = z.object({
  rawMaterialId: z.string().min(1, "Pilih bahan"),
  quantity: z.coerce.number().min(0.01, "Jumlah > 0"),
});

const foodSchema = z.object({
  name: z.string().min(1, "Nama makanan tidak boleh kosong"),
  sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  ingredients: z.array(ingredientSchema).min(1, "Minimal 1 bahan baku"),
});

type FoodFormValues = z.infer<typeof foodSchema>;

const PriceSuggestionCalculator = ({ costPrice }: { costPrice: number }) => {
    const { sales, operationalCosts } = useAppContext();
    const [days, setDays] = useState(30);

    const { opCostPerUnit, totalOpCost, totalUnitsSold } = useMemo(() => {
        const dateTo = new Date();
        const dateFrom = addDays(dateTo, -days);

        const relevantSales = sales.filter(s => isWithinInterval(parseISO(s.date), {start: dateFrom, end: dateTo}));
        const relevantOpCosts = operationalCosts.filter(c => isWithinInterval(parseISO(c.date), {start: dateFrom, end: dateTo}));
        
        const totalOpCost = relevantOpCosts.reduce((acc, cost) => acc + cost.amount, 0);
        const totalUnitsSold = relevantSales.reduce((acc, sale) => acc + sale.quantity, 0);

        if (totalUnitsSold === 0) return { opCostPerUnit: 0, totalOpCost, totalUnitsSold };

        return { opCostPerUnit: totalOpCost / totalUnitsSold, totalOpCost, totalUnitsSold };
    }, [days, sales, operationalCosts]);

    const totalCost = costPrice + opCostPerUnit;

    const getSuggestedPrice = (margin: number) => {
        if (margin >= 100) return Infinity;
        return totalCost / (1 - (margin / 100));
    }

    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="text-lg">Kalkulator Saran Harga</CardTitle>
                <CardDescription>Berdasarkan HPP dan alokasi biaya operasional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Periode Analisis</span>
                    <Select value={String(days)} onValueChange={(val) => setDays(Number(val))}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 Hari</SelectItem>
                            <SelectItem value="30">30 Hari</SelectItem>
                            <SelectItem value="90">90 Hari</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Harga Pokok (HPP)</span>
                    <span className="font-semibold">{formatCurrency(costPrice)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm" title={`${formatCurrency(totalOpCost)} / ${totalUnitsSold} unit terjual`}>
                    <span className="text-muted-foreground">Biaya Operasional / Unit</span>
                    <span className="font-semibold">{formatCurrency(opCostPerUnit)}</span>
                </div>
                <Separator/>
                 <div className="flex justify-between items-center text-base">
                    <span className="font-bold">Total Biaya / Unit</span>
                    <span className="font-bold">{formatCurrency(totalCost)}</span>
                </div>
                <Separator/>
                <div className="space-y-2 pt-2">
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

const FoodForm = React.forwardRef(({ onFinished }: { onFinished: () => void }, ref) => {
    const { addFood, updateFood, rawMaterials } = useAppContext();
    const { toast } = useToast();
    const [editingFood, setEditingFood] = useState<Food | null>(null);
    
    const form = useForm<FoodFormValues>({
        resolver: zodResolver(foodSchema),
        defaultValues: { name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }] },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    const watchedIngredients = useWatch({ control: form.control, name: 'ingredients' });

    const calculatedCostPrice = useMemo(() => {
        if (!watchedIngredients || rawMaterials.length === 0) return 0;
        return watchedIngredients.reduce((acc, item) => {
            const material = rawMaterials.find(m => m.id === item.rawMaterialId);
            const cost = material ? material.costPerUnit * item.quantity : 0;
            return acc + cost;
        }, 0);
    }, [watchedIngredients, rawMaterials]);

    async function onSubmit(values: FoodFormValues) {
        try {
            const foodData = { ...values, costPrice: calculatedCostPrice };
            if (editingFood) {
                await updateFood(editingFood.id, foodData);
                toast({ title: "Sukses", description: "Makanan berhasil diperbarui." });
            } else {
                await addFood(foodData);
                toast({ title: "Sukses", description: "Makanan berhasil ditambahkan." });
            }
            onFinished();
            setEditingFood(null);
            form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }] });
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }
    
    React.useImperativeHandle(ref, () => ({
        handleEdit: (food: Food) => {
            setEditingFood(food);
            form.reset(food);
        }
    }));

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Makanan</FormLabel><FormControl><Input {...field} placeholder="cth: Nasi Goreng" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem><FormLabel>Harga Jual</FormLabel><FormControl><Input type="number" {...field} placeholder="cth: 25000" /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                
                <div>
                    <FormLabel>Resep / Bahan Baku</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                           <FormField
                                control={form.control}
                                name={`ingredients.${index}.rawMaterialId`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Pilih bahan baku..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {rawMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.quantity`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input type="number" step="0.01" {...field} className="w-28" placeholder="Jumlah"/></FormControl>
                                    <FormMessage/>
                                </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ rawMaterialId: "", quantity: 1 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Tambah Bahan
                    </Button>
                    </div>
                </div>

                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Rincian Harga Pokok (HPP)</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <p className="text-2xl font-bold">{formatCurrency(calculatedCostPrice)}</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div>
                        <PriceSuggestionCalculator costPrice={calculatedCostPrice} />
                    </div>
                </div>
                
                <Button type="submit">{editingFood ? "Simpan Perubahan" : "Tambah Makanan"}</Button>
                 {editingFood && (
                    <Button type="button" variant="ghost" onClick={() => { setEditingFood(null); form.reset({ name: "", sellingPrice: 0, ingredients: [{ rawMaterialId: "", quantity: 1 }] }); }}>Batal Edit</Button>
                )}
            </form>
        </Form>
    );
});
FoodForm.displayName = 'FoodForm';


export default function MakananPage() {
    const { foods, deleteFood } = useAppContext();
    const { toast } = useToast();
    const [isFormVisible, setFormVisible] = useState(false);
    const formRef = React.useRef<{ handleEdit: (food: Food) => void }>(null);


    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus makanan ini?")) return;
        try {
            const result = await deleteFood(id);
            if (!result.ok) {
                throw new Error(result.message);
            }
            toast({ title: "Sukses", description: result.message });
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };

    const handleEditClick = (food: Food) => {
        setFormVisible(true);
        // Using a timeout to ensure the form is rendered before calling the method
        setTimeout(() => {
            formRef.current?.handleEdit(food);
        }, 10);
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Manajemen Makanan</h1>
                <Button onClick={() => setFormVisible(!isFormVisible)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {isFormVisible ? "Tutup Form" : "Tambah/Edit Makanan"}
                </Button>
            </div>

            {isFormVisible && (
                <Card>
                    <CardHeader>
                         <CardTitle>Form Makanan</CardTitle>
                         <CardDescription>Tambah makanan baru atau pilih dari daftar di bawah untuk mengedit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <FoodForm ref={formRef} onFinished={() => setFormVisible(false)} />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Daftar Makanan</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Makanan</TableHead>
                                <TableHead>Harga Pokok</TableHead>
                                <TableHead>Harga Jual</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {foods && foods.length > 0 ? (
                            foods.map(food => (
                                <TableRow key={food.id}>
                                    <TableCell className="font-medium">{food.name}</TableCell>
                                    <TableCell>{formatCurrency(food.costPrice)}</TableCell>
                                    <TableCell>{formatCurrency(food.sellingPrice)}</TableCell>
                                    <TableCell className="flex gap-2 justify-end">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(food)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(food.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Belum ada data makanan.
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
