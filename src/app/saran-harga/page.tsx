"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SuggestOptimalPricingOutput } from "@/ai/flows/suggest-optimal-pricing";
import { getPricingSuggestion } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";

const pricingSchema = z.object({
  drinkName: z.string().min(1, "Nama minuman harus dipilih."),
  salesData: z.string().min(1, "Data penjualan harus diisi."),
  ingredientCosts: z.string().min(1, "Biaya bahan harus diisi."),
  competitorPrices: z.string().min(1, "Harga kompetitor harus diisi."),
});

export default function SaranHargaPage() {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<SuggestOptimalPricingOutput | null>(null);
  const { toast } = useToast();
  const { drinks, sales } = useAppContext();
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>('');

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      drinkName: "",
      salesData: "",
      ingredientCosts: "",
      competitorPrices: "Contoh: Kompetitor A menjual Rp 14.000, Kompetitor B menjual Rp 16.000.",
    },
  });

  const { setValue, reset } = form;

  useEffect(() => {
    if (selectedDrinkId) {
      const drink = drinks.find(d => d.id === selectedDrinkId);
      if (drink) {
        setValue("drinkName", drink.name);
        setValue("ingredientCosts", `Harga pokok per porsi: ${formatCurrency(drink.costPrice)}`);

        const drinkSales = sales.filter(s => s.drinkId === drink.id);
        const totalQuantity = drinkSales.reduce((acc, s) => acc + s.quantity, 0);
        const salesSummary = totalQuantity > 0 
          ? `Terjual ${totalQuantity} cup. Harga jual saat ini ${formatCurrency(drink.sellingPrice)}.`
          : `Belum ada data penjualan untuk minuman ini. Harga jual saat ini ${formatCurrency(drink.sellingPrice)}.`;
        setValue("salesData", salesSummary);
      }
    } else {
        reset({
            drinkName: "",
            salesData: "",
            ingredientCosts: "",
            competitorPrices: "Contoh: Kompetitor A menjual Rp 14.000, Kompetitor B menjual Rp 16.000.",
        });
    }
  }, [selectedDrinkId, drinks, sales, setValue, reset]);

  function onSubmit(values: z.infer<typeof pricingSchema>) {
    startTransition(async () => {
      const result = await getPricingSuggestion(values);
      if (result.success && result.data) {
        setSuggestion(result.data);
        toast({ title: "Saran Harga Diterima!", description: "AI telah memberikan saran harga optimal." });
      } else {
        toast({
          title: "Terjadi Kesalahan",
          description: result.error || "Gagal mendapatkan saran harga.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <MainLayout>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Saran Harga Cerdas</CardTitle>
                <CardDescription>
                  Pilih minuman untuk mendapatkan rekomendasi harga optimal dari AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormItem>
                   <FormLabel>Pilih Minuman</FormLabel>
                    <Select onValueChange={setSelectedDrinkId} value={selectedDrinkId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih minuman untuk dianalisis..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drinks.map(drink => (
                          <SelectItem key={drink.id} value={drink.id}>{drink.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </FormItem>

                <FormField
                  control={form.control}
                  name="salesData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Penjualan (Otomatis)</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ingredientCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Bahan (Otomatis)</FormLabel>
                      <FormControl><Textarea {...field} rows={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="competitorPrices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Kompetitor</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending || !selectedDrinkId}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  Dapatkan Saran
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="flex items-center justify-center">
          {isPending && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          
          {!isPending && suggestion && (
            <Card className="w-full bg-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb/> Rekomendasi untuk {form.getValues("drinkName")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Harga Jual yang Disarankan</p>
                  <p className="text-5xl font-bold text-primary">
                    {formatCurrency(suggestion.suggestedPrice)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Alasan:</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isPending && !suggestion && (
            <div className="text-center text-muted-foreground">
              <Lightbulb className="mx-auto h-12 w-12" />
              <p className="mt-4">{selectedDrinkId ? "Hasil saran harga akan muncul di sini." : "Pilih minuman untuk memulai."}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
