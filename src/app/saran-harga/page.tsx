"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SuggestOptimalPricingOutput } from "@/ai/flows/suggest-optimal-pricing";
import { getPricingSuggestion } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";

const pricingSchema = z.object({
  drinkName: z.string().min(1, "Nama minuman harus diisi."),
  salesData: z.string().min(1, "Data penjualan harus diisi."),
  ingredientCosts: z.string().min(1, "Biaya bahan harus diisi."),
  competitorPrices: z.string().min(1, "Harga kompetitor harus diisi."),
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function SaranHargaPage() {
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<SuggestOptimalPricingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      drinkName: "",
      salesData: "Contoh: 50 cup terjual dalam seminggu dengan harga Rp 15,000.",
      ingredientCosts: "Contoh: Total biaya bahan per cup Rp 7,000.",
      competitorPrices: "Contoh: Kompetitor A menjual Rp 14,000, Kompetitor B menjual Rp 16,000.",
    },
  });

  function onSubmit(values: z.infer<typeof pricingSchema>) {
    startTransition(async () => {
      const result = await getPricingSuggestion(values);
      if (result.success) {
        setSuggestion(result.data);
        toast({ title: "Saran Harga Diterima!", description: "AI telah memberikan saran harga optimal." });
      } else {
        toast({
          title: "Terjadi Kesalahan",
          description: result.error,
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
                  Dapatkan rekomendasi harga optimal dari AI untuk memaksimalkan keuntungan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="drinkName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Minuman</FormLabel>
                      <FormControl><Input {...field} placeholder="Cth: Es Kopi Susu" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Penjualan</FormLabel>
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
                      <FormLabel>Biaya Bahan per Porsi</FormLabel>
                      <FormControl><Textarea {...field} rows={3} /></FormControl>
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
                <Button type="submit" disabled={isPending}>
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
                  <Lightbulb/> Rekomendasi Harga
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
              <p className="mt-4">Hasil saran harga akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
